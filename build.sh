echo "Building ProphetFeedValueVerifier Contract ..."
cd prophet_feed_value_verifier
cargo contract build --release
cd ..
echo "Building ProphetFeedValueStorage Contract ..."
cd prophet_feed_value_storage
cargo contract build --release
cargo contract upload --execute --suri //Alice
cd ..
cp prophet_feed_value_storage/target/ink/prophet_feed_value_storage.json node/src/blockchain/contract_metadata/prophet_feed_value_storage.json
cp prophet_feed_value_verifier/target/ink/prophet_feed_value_verifier.json node/src/blockchain/contract_metadata/prophet_feed_value_verifier.json
echo "Building Success"