#![cfg_attr(not(feature = "std"), no_std, no_main)]
pub use self::prophet_feed_value_storage::{
    AnswerData, AnswerParam, ProphetFeedValueStorageRef, TDecimal, TPairId, TRoundId, TValue,
};

#[ink::contract]
mod prophet_feed_value_storage {
    use ink::prelude::vec::Vec;
    use ink::storage::Mapping;
    use scale::{Decode, Encode};

    ///Type of pair id
    pub type TPairId = u32;
    ///Type of value of pair price
    pub type TValue = u128;
    ///Type of number decimal of value
    pub type TDecimal = u16;
    ///Type of round id
    pub type TRoundId = u64;
    pub type TAnswerReturn = (TValue, TDecimal, TRoundId, Timestamp);
    #[derive(Decode, Encode, Debug, PartialEq, Eq, Copy, Clone)]
    #[cfg_attr(
        feature = "std",
        derive(scale_info::TypeInfo, ink::storage::traits::StorageLayout)
    )]
    pub struct AnswerData {
        pub value: TValue,
        pub decimal: TDecimal,
        pub round_id: TRoundId,
        pub timestamp: Timestamp,
    }
    #[derive(Decode, Encode)]
    #[cfg_attr(
        feature = "std",
        derive(scale_info::TypeInfo, ink::storage::traits::StorageLayout)
    )]
    pub struct AnswerParam {
        pair_id: TPairId,
        round_id: TRoundId,
        value: TValue,
        decimal: TDecimal,
        timestamp: Timestamp,
    }

    #[ink(event)]
    pub struct NewAnswer {
        pair_id: TPairId,
        round_id: TRoundId,
        value: TValue,
        decimal: TDecimal,
        timestamp: Timestamp,
    }

    /// Defines the storage of your contract.
    /// Add new fields to the below struct in order
    /// to add new static storage fields to your contract.
    #[ink(storage)]
    pub struct ProphetFeedValueStorage {
        storage: Mapping<(TPairId, TRoundId), AnswerData>,
        latest_answers: Mapping<TPairId, AnswerData>,
        verifier_contract_address: AccountId,
        owner: AccountId,
    }

    #[derive(Encode, Decode, Debug, PartialEq, Eq, Copy, Clone)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
    pub enum Error {
        PairNotExists,
        NotVerifierContract,
        NotOwner,
    }
    #[ink(impl)]
    impl ProphetFeedValueStorage {
        fn _convert_answer_to_answer_return(&self, answer: AnswerData) -> TAnswerReturn {
            (
                answer.value,
                answer.decimal,
                answer.round_id,
                answer.timestamp,
            )
        }
        fn _is_pair_exists(&self, pair_id: &TPairId) -> bool {
            self.latest_answers.get(pair_id).is_some()
        }

        fn _get_latest_round_id_or_zero(&self, pair_id: &TPairId) -> TRoundId {
            self.latest_answers
                .get(pair_id)
                .unwrap_or(AnswerData {
                    value: 0,
                    decimal: 0,
                    round_id: 0,
                    timestamp: 0,
                })
                .round_id
        }

        fn _get_latest_answer(&self, pair_id: &TPairId) -> Option<AnswerData> {
            self.latest_answers.get(pair_id).into()
        }

        fn _get_answer(&self, pair_id: &TPairId, round_id: &TRoundId) -> Option<AnswerData> {
            self.storage.get((pair_id, round_id)).into()
        }

        fn _ensure_verifier(&mut self) -> Result<(), Error> {
            let caller = self.env().caller();
            if caller != self.verifier_contract_address {
                return Err(Error::NotVerifierContract);
            }
            Ok(())
        }

        fn _ensure_owner(&self) -> Result<(), Error> {
            let caller = self.env().caller();
            if caller != self.owner {
                return Err(Error::NotOwner);
            }
            Ok(())
        }
    }

    impl ProphetFeedValueStorage {
        ///Create new contract with `verifier_contract_address` has default is `caller`
        #[ink(constructor)]
        pub fn new(owner: AccountId) -> Self {
            Self {
                storage: Default::default(),
                latest_answers: Default::default(),
                verifier_contract_address: Self::env().caller(),
                owner,
            }
        }

        ///Get current verifier contract address
        #[ink(message)]
        pub fn get_verifier_contract(&self) -> AccountId {
            self.verifier_contract_address
        }

        /// Get a answer per `pair_id` and `round_id`
        #[ink(message)]
        pub fn get_answer(
            &self,
            pair_id: TPairId,
            round_id: TRoundId,
        ) -> Result<Option<TAnswerReturn>, Error> {
            if !self._is_pair_exists(&pair_id) {
                return Err(Error::PairNotExists);
            }
            match self._get_answer(&pair_id, &round_id) {
                None => Ok(None),
                Some(answer) => Ok(Some(self._convert_answer_to_answer_return(answer))),
            }
        }

        /// Get latest answer of `pair_id`
        #[ink(message)]
        pub fn get_latest_answer(&self, pair_id: TPairId) -> Result<Option<TAnswerReturn>, Error> {
            if !self._is_pair_exists(&pair_id) {
                return Err(Error::PairNotExists);
            }
            match self._get_latest_answer(&pair_id) {
                None => Ok(None),
                Some(answer) => Ok(Some(self._convert_answer_to_answer_return(answer))),
            }
        }

        ///Get latest price of a `pair_id`
        #[ink(message)]
        pub fn get_latest_price(&self, pair_id: TPairId) -> Result<TValue, Error> {
            let latest_round_id = self.latest_answers.get(pair_id);
            match latest_round_id {
                None => Err(Error::PairNotExists),
                Some(answer) => Ok(answer.value),
            }
        }

        /// Update answers
        /// Only call from verifier
        /// Emit event `NewAnswer` if it is a new answer
        #[ink(message)]
        pub fn set_answer(
            &mut self,
            pair_id: TPairId,
            round_id: TRoundId,
            value: TValue,
            decimal: TDecimal,
            timestamp: Timestamp,
        ) -> Result<(), Error> {
            self._ensure_verifier()?;

            let new_answer = AnswerData {
                decimal,
                value,
                round_id,
                timestamp,
            };
            self.storage.insert((pair_id, round_id), &new_answer);
            let latest_round_id = self._get_latest_round_id_or_zero(&pair_id);
            if latest_round_id < round_id {
                self.latest_answers.insert(pair_id, &new_answer);
                self.env().emit_event(NewAnswer {
                    pair_id,
                    decimal,
                    round_id,
                    timestamp,
                    value,
                })
            }
            Ok(())
        }

        /// Update answers
        /// Only call from verifier
        /// Emit event `NewAnswer` if it is a new answer
        #[ink(message)]
        pub fn set_answers(&mut self, answers: Vec<AnswerParam>) -> Result<(), Error> {
            self._ensure_verifier()?;
            for answer in answers.iter() {
                let pair_id = answer.pair_id;
                let round_id = answer.round_id;
                let decimal = answer.decimal;
                let value = answer.value;
                let timestamp = answer.timestamp;

                let new_answer = AnswerData {
                    decimal,
                    value,
                    round_id,
                    timestamp,
                };
                self.storage.insert((pair_id, round_id), &new_answer);
                let latest_round_id = self._get_latest_round_id_or_zero(&pair_id);
                if latest_round_id < round_id {
                    self.latest_answers.insert(pair_id, &new_answer);
                    self.env().emit_event(NewAnswer {
                        pair_id,
                        decimal,
                        round_id,
                        timestamp,
                        value,
                    })
                }
            }
            Ok(())
        }

        /// Set verifier contract
        /// ONLY called by owner
        #[ink(message)]
        pub fn set_verifier_contract(
            &mut self,
            new_verifier_contract_address: AccountId,
        ) -> Result<(), Error> {
            self._ensure_owner()?;
            self.verifier_contract_address = new_verifier_contract_address;
            Ok(())
        }

        /// Get owner address
        #[ink(message)]
        pub fn get_owner(&self) -> AccountId {
            self.owner
        }

        /// Get this contract address
        #[ink(message)]
        pub fn get_contract_address(&self) -> AccountId {
            self.env().account_id()
        }
    }

    /// Unit tests in Rust are normally defined within such a `#[cfg(test)]`
    /// module and test functions are marked with a `#[test]` attribute.
    /// The below code is technically just normal Rust code.
    #[cfg(test)]
    mod tests {
        /// Imports all the definitions from the outer scope so we can use them here.
        use super::*;

        /// We test if the default constructor does its job.
        #[ink::test]
        fn default_works() {}

        /// We test a simple use case of our contract.
        #[ink::test]
        fn it_works() {}
    }

    /// This is how you'd write end-to-end (E2E) or integration tests for ink! contracts.
    ///
    /// When running these you need to make sure that you:
    /// - Compile the tests with the `e2e-tests` feature flag enabled (`--features e2e-tests`)
    /// - Are running a Substrate node which contains `pallet-contracts` in the background
    #[cfg(all(test, feature = "e2e-tests"))]
    mod e2e_tests {
        /// Imports all the definitions from the outer scope so we can use them here.
        use super::*;

        /// A helper function used for calling contract messages.
        use ink_e2e::build_message;

        /// The End-to-End test `Result` type.
        type E2EResult<T> = std::result::Result<T, Box<dyn std::error::Error>>;

        /// We test that we can upload and instantiate the contract using its default constructor.
        #[ink_e2e::test]
        async fn default_works(mut client: ink_e2e::Client<C, E>) -> E2EResult<()> {
            // Given
            let constructor = ProphetFeedValueStorageRef::default();

            // When
            let contract_account_id = client
                .instantiate(
                    "prophet_feed_value_storage",
                    &ink_e2e::alice(),
                    constructor,
                    0,
                    None,
                )
                .await
                .expect("instantiate failed")
                .account_id;

            // Then
            let get = build_message::<ProphetFeedValueStorageRef>(contract_account_id.clone())
                .call(|prophet_feed_value_storage| prophet_feed_value_storage.get());
            let get_result = client.call_dry_run(&ink_e2e::alice(), &get, 0, None).await;
            assert!(matches!(get_result.return_value(), false));

            Ok(())
        }

        /// We test that we can read and write a value from the on-chain contract contract.
        #[ink_e2e::test]
        async fn it_works(mut client: ink_e2e::Client<C, E>) -> E2EResult<()> {
            // Given
            let constructor = ProphetFeedValueStorageRef::new(false);
            let contract_account_id = client
                .instantiate(
                    "prophet_feed_value_storage",
                    &ink_e2e::bob(),
                    constructor,
                    0,
                    None,
                )
                .await
                .expect("instantiate failed")
                .account_id;

            let get = build_message::<ProphetFeedValueStorageRef>(contract_account_id.clone())
                .call(|prophet_feed_value_storage| prophet_feed_value_storage.get());
            let get_result = client.call_dry_run(&ink_e2e::bob(), &get, 0, None).await;
            assert!(matches!(get_result.return_value(), false));

            // When
            let flip = build_message::<ProphetFeedValueStorageRef>(contract_account_id.clone())
                .call(|prophet_feed_value_storage| prophet_feed_value_storage.flip());
            let _flip_result = client
                .call(&ink_e2e::bob(), flip, 0, None)
                .await
                .expect("flip failed");

            // Then
            let get = build_message::<ProphetFeedValueStorageRef>(contract_account_id.clone())
                .call(|prophet_feed_value_storage| prophet_feed_value_storage.get());
            let get_result = client.call_dry_run(&ink_e2e::bob(), &get, 0, None).await;
            assert!(matches!(get_result.return_value(), true));

            Ok(())
        }
    }
}
