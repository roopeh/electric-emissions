cd backend
rm -r build
echo "Building TypeScript backend..."
npm run tsc
cp -r ./frontend ./build/frontend
cp -r src/sampleData ./build/sampleData
