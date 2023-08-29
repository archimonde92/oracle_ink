#![cfg_attr(not(feature = "std"), no_std, no_main)]

#[ink::contract]
mod prophet_feed_value_verifier {
    use ink::env::{hash, hash_bytes};
    use ink::{prelude::vec::Vec, storage::Mapping};
    use prophet_feed_value_storage::{
        AnswerData, AnswerParam, ProphetFeedValueStorageRef, TDecimal, TPairId, TRoundId, TValue,
    };
    use scale::{Decode, Encode};
    /// Defines the storage of your contract.
    /// Add new fields to the below struct in order
    /// to add new static storage fields to your contract.
    #[ink(storage)]
    pub struct ProphetFeedValueVerifier {
        /// Stores a single `bool` value on the storage.
        storage_contract: ProphetFeedValueStorageRef,
        nodes: Mapping<AccountId, bool>,
        processed_txn: Mapping<Hash, bool>,
        owner: AccountId,
    }

    #[derive(Encode, Decode, Debug, PartialEq, Eq, Copy, Clone)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
    pub enum Error {
        NotVerifierContract,
        EmptyAnswersFound,
        EmptySignaturesFound,
        NotMatchedAnswerLengthAndSignatureLength,
        NotOwner,
    }

    #[ink(impl)]
    impl ProphetFeedValueVerifier {
        fn _ensure_owner(&self) -> Result<(), Error> {
            let caller = self.env().caller();
            if caller != self.owner {
                return Err(Error::NotOwner);
            }
            Ok(())
        }

        fn _update_new_answer(
            &mut self,
            pair_id: TPairId,
            round_id: TRoundId,
            value: TValue,
            decimal: TDecimal,
            timestamp: Timestamp,
        ) -> Result<(), Error> {
            let result = self
                .storage_contract
                .set_answer(pair_id, round_id, value, decimal, timestamp);
            match result {
                Ok(_) => Ok(()),
                Err(_) => Err(Error::NotVerifierContract),
            }
        }

        fn _update_new_answers(&mut self, answers: Vec<AnswerParam>) -> Result<(), Error> {
            let result = self.storage_contract.set_answers(answers);
            match result {
                Ok(_) => Ok(()),
                Err(_) => Err(Error::NotVerifierContract),
            }
        }

        fn _is_valid_answers(&self, answers: &Vec<AnswerData>) -> Result<(), Error> {
            //TODO valid answers
            Ok(())
        }
        fn _is_valid_answers_and_signatures(
            &self,
            signatures: &Vec<Hash>,
            answers: &Vec<AnswerData>,
        ) -> Result<(), Error> {
            if answers.len() == 0 {
                return Err(Error::EmptyAnswersFound);
            }
            if signatures.len() == 0 {
                return Err(Error::EmptySignaturesFound);
            }
            if signatures.len() != answers.len() {
                return Err(Error::NotMatchedAnswerLengthAndSignatureLength);
            }
            self._is_valid_answers(answers)?;

            //TODO valid signatures
            Ok(())
        }

        fn _aggregate_answer(&self, answers: Vec<AnswerData>) -> AnswerData {
            //TODO improve aggregate answer
            let mut answer = answers[0].clone();
            let mut total_value: u128 = 0;
            for answer_data in answers.iter() {
                total_value = total_value + answer_data.value
            }
            answer.value = total_value.div_euclid(answers.len().try_into().unwrap_or(1));
            answer
        }

        fn _hash_keccak_256(&self, input: &[u8]) -> [u8; 32] {
            let mut output = <hash::Keccak256 as hash::HashOutput>::Type::default();
            hash_bytes::<hash::Keccak256>(input, &mut output);
            output
        }

        pub fn _packing_data_to_message_hash(&self, data: AnswerData) -> [u8; 32] {
            let sum: u128 = u128::from(data.timestamp)
                + u128::from(data.decimal) * 10_u128.pow(11)
                + u128::from(data.round_id) * 10_u128.pow(13)
                + data.value * 10_u128.pow(23);
            self._hash_keccak_256(&sum.to_be_bytes())
        }
    }

    impl ProphetFeedValueVerifier {
        /// Constructor that initializes the `bool` value to the given `init_value`.
        #[ink(constructor)]
        pub fn new(storage_contract_code_hash: Hash) -> Self {
            let storage_contract = ProphetFeedValueStorageRef::new(Self::env().caller())
                .code_hash(storage_contract_code_hash)
                .endowment(0)
                .salt_bytes([0xDE, 0xAD, 0xBE, 0xEF])
                .instantiate();
            Self {
                storage_contract,
                owner: Self::env().caller(),
                nodes: Default::default(),
                processed_txn: Default::default(),
            }
        }

        /// Constructor that initializes the `bool` value to `false`.
        ///
        /// Constructors can delegate to other constructors.
        #[ink(constructor)]
        pub fn default() -> Self {
            Self::new(Default::default())
        }

        /// Get storage contract address
        #[ink(message)]
        pub fn get_storage_address(&self) -> AccountId {
            self.storage_contract.get_contract_address()
        }

        /// A message that can be called on instantiated contracts.
        /// This one flips the value of the stored `bool` from `true`
        /// to `false` and vice versa.
        #[ink(message)]
        pub fn restricted_update_new_answer(
            &mut self,
            pair_id: TPairId,
            round_id: TRoundId,
            value: TValue,
            decimal: TDecimal,
            timestamp: Timestamp,
        ) -> Result<(), Error> {
            self._ensure_owner()?;
            self._update_new_answer(pair_id, round_id, value, decimal, timestamp)
        }

        #[ink(message)]
        pub fn restricted_update_new_answers(
            &mut self,
            answers: Vec<AnswerParam>,
        ) -> Result<(), Error> {
            self._ensure_owner()?;
            self._update_new_answers(answers)
        }

        #[ink(message)]
        pub fn transmit_process(
            &mut self,
            pair_id: TPairId,
            answers: Vec<AnswerData>,
            signatures: Vec<Hash>,
        ) -> Result<(), Error> {
            //Check valid answers and signatures
            self._is_valid_answers_and_signatures(&signatures, &answers)?;
            //Aggregate result
            let aggregated_answer = self._aggregate_answer(answers.clone());
            //Update new answer of pair_id
            self._update_new_answer(
                pair_id,
                aggregated_answer.round_id,
                aggregated_answer.value,
                aggregated_answer.decimal,
                aggregated_answer.timestamp,
            )?;
            Ok(())
        }

        #[ink(message)]
        pub fn get_verifier(&self) -> AccountId {
            self.storage_contract.get_verifier_contract()
        }

        #[ink(message)]
        pub fn recovery_test(
            &self,
            signature: [u8; 65],
            message: [u8; 32],
        ) -> Result<[u8; 33], Error> {
            match self.env().ecdsa_recover(&signature, &message) {
                Ok(address) => Ok(address),
                Err(_) => Err(Error::NotMatchedAnswerLengthAndSignatureLength),
            }
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
            let constructor = ProphetFeedValueVerifierRef::default();

            // When
            let contract_account_id = client
                .instantiate(
                    "prophet_feed_value_verifier",
                    &ink_e2e::alice(),
                    constructor,
                    0,
                    None,
                )
                .await
                .expect("instantiate failed")
                .account_id;

            // Then
            let get = build_message::<ProphetFeedValueVerifierRef>(contract_account_id.clone())
                .call(|prophet_feed_value_verifier| prophet_feed_value_verifier.get());
            let get_result = client.call_dry_run(&ink_e2e::alice(), &get, 0, None).await;
            assert!(matches!(get_result.return_value(), false));

            Ok(())
        }

        /// We test that we can read and write a value from the on-chain contract contract.
        #[ink_e2e::test]
        async fn it_works(mut client: ink_e2e::Client<C, E>) -> E2EResult<()> {
            // Given
            let constructor = ProphetFeedValueVerifierRef::new(false);
            let contract_account_id = client
                .instantiate(
                    "prophet_feed_value_verifier",
                    &ink_e2e::bob(),
                    constructor,
                    0,
                    None,
                )
                .await
                .expect("instantiate failed")
                .account_id;

            let get = build_message::<ProphetFeedValueVerifierRef>(contract_account_id.clone())
                .call(|prophet_feed_value_verifier| prophet_feed_value_verifier.get());
            let get_result = client.call_dry_run(&ink_e2e::bob(), &get, 0, None).await;
            assert!(matches!(get_result.return_value(), false));

            // When
            let flip = build_message::<ProphetFeedValueVerifierRef>(contract_account_id.clone())
                .call(|prophet_feed_value_verifier| prophet_feed_value_verifier.flip());
            let _flip_result = client
                .call(&ink_e2e::bob(), flip, 0, None)
                .await
                .expect("flip failed");

            // Then
            let get = build_message::<ProphetFeedValueVerifierRef>(contract_account_id.clone())
                .call(|prophet_feed_value_verifier| prophet_feed_value_verifier.get());
            let get_result = client.call_dry_run(&ink_e2e::bob(), &get, 0, None).await;
            assert!(matches!(get_result.return_value(), true));

            Ok(())
        }
    }
}
