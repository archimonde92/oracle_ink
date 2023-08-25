#![cfg_attr(not(feature = "std"), no_std, no_main)]

#[ink::contract]
mod prophet_feed_value_verifier {
    use prophet_feed_value_storage::ProphetFeedValueStorageRef;
    use scale::{Decode, Encode};
    /// Defines the storage of your contract.
    /// Add new fields to the below struct in order
    /// to add new static storage fields to your contract.
    #[ink(storage)]
    pub struct ProphetFeedValueVerifier {
        /// Stores a single `bool` value on the storage.
        storage_contract: ProphetFeedValueStorageRef,
        owner: AccountId,
    }

    #[derive(Encode, Decode, Debug, PartialEq, Eq, Copy, Clone)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
    pub enum Error {
        NotVerifierContract,
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
        pub fn set_price(&mut self, pair_id: i32, round_id: i64, value: i128) -> Result<(), Error> {
            self._ensure_owner()?;
            let caller = self.storage_contract.set_price(pair_id, round_id, value);
            match caller {
                Ok(_) => Ok(()),
                Err(_) => Err(Error::NotVerifierContract),
            }
        }

        #[ink(message)]
        pub fn get_verifier(&self) -> AccountId {
            self.storage_contract.get_verifier_contract()
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
