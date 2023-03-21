cd backend
rm -r frontend
cd ../frontend
rm -r build
echo "Building and deploying frontend..."
npm run build
mv ./build ../backend/frontend
cd ../backend/build
rm -r frontend
cp -r ../frontend ./frontend
