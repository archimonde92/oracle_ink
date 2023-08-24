#![cfg_attr(not(feature = "std"), no_std, no_main)]

#[ink::contract]
mod prophet_feed_value_storage {
    use ink::storage::Mapping;
    use scale::{Decode, Encode};

    /// Defines the storage of your contract.
    /// Add new fields to the below struct in order
    /// to add new static storage fields to your contract.
    #[ink(storage)]
    pub struct ProphetFeedValueStorage {
        /// Stores a single `bool` value on the storage.
        storage: Mapping<(i32, i64), i128>,
        latest_rounds: Mapping<i32, i64>,
        verifier_contract_address: AccountId,
    }

    #[derive(Encode, Decode, Debug, PartialEq, Eq, Copy, Clone)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
    pub enum Error {
        PairNotExists,
        NotVerifierContract,
    }

    impl ProphetFeedValueStorage {
        /// Constructor that initializes the `AccountId` value to the given `verifier`.
        #[ink(constructor)]
        pub fn new(verifier: AccountId) -> Self {
            Self {
                storage: Default::default(),
                latest_rounds: Default::default(),
                verifier_contract_address: verifier,
            }
        }

        /// Simply returns the current value of our `bool`.
        #[ink(message)]
        pub fn get_price(&self, pair_id: i32, round_id: i64) -> Result<i128, Error> {
            if !self._is_pair_exists(&pair_id) {
                return Err(Error::PairNotExists);
            }
            Ok(self._get_price(&pair_id, &round_id))
        }

        #[ink(message)]
        pub fn get_lastest_price(&self, pair_id: i32) -> Result<i128, Error> {
            let latest_round = self.latest_rounds.get(pair_id);
            match latest_round {
                None => Err(Error::PairNotExists),
                Some(round_id) => Ok(self._get_price(&pair_id, &round_id)),
            }
        }

        #[ink(message)]
        pub fn set_price(&mut self, pair_id: i32, round_id: i64, value: i128) -> Result<(), Error> {
            if !self._is_verifier(self.env().caller()) {
                return Err(Error::NotVerifierContract);
            }
            self.storage.insert((pair_id, round_id), &value);
            let latest_round_id = self._get_latest_round_id(&pair_id);
            if latest_round_id < round_id {
                self.latest_rounds.insert(pair_id, &round_id);
            }
            Ok(())
        }

        #[ink(message)]
        pub fn get_verifier_contract(&self) -> AccountId {
            self.verifier_contract_address
        }

        fn _is_pair_exists(&self, pair_id: &i32) -> bool {
            self.latest_rounds.get(pair_id).is_some()
        }

        fn _get_latest_round_id(&self, pair_id: &i32) -> i64 {
            self.latest_rounds.get(pair_id).unwrap_or(0)
        }

        fn _get_price(&self, pair_id: &i32, round_id: &i64) -> i128 {
            self.storage.get((pair_id, round_id)).unwrap_or(0)
        }

        fn _is_verifier(&self, caller: AccountId) -> bool {
            caller == self.verifier_contract_address
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
