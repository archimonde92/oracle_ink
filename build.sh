echo "Building ProphetFeedValueVerifier Contract ..."
cd prophet_feed_value_verifier
cargo contract build --release
cd ..
echo "Building ProphetFeedValueStorage Contract ..."
cd prophet_feed_value_storage
cargo contract build --release
cargo contract upload --execute --suri //Alice
echo "Building Success"