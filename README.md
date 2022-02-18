# phlaunt-web-03

Github oauth app https://github.com/settings/applications/1834374

Firebase authencation https://console.firebase.google.com/u/anandchakru@gmail.com/project/phlaunt-001/authentication/providers

Authentication with Firebase and Github is done.
## initialize
```sh
APPNAME=phlaunt-web-03
npx create-react-app $APPNAME --template redux-typescript
cd $APPNAME
unset APPNAME
mkdir -p .github/workflows
touch .github/workflows/build-deploy.yml
mv ./src/App.css ./src/App.scss
mv ./src/index.css ./src/index.scss
sed -i.bu 's/css/scss/g' ./src/index.tsx
sed -i.bu 's/css/scss/g' ./src/App.tsx
sed -i.bu 's/"react-jsx"/"react-jsx",\n    "noImplicitAny": false/' tsconfig.json
# Scss
npm i node-sass
# Material
npm i @mui/material @mui/icons-material @emotion/react @emotion/styled @fontsource/roboto @mui/lab
# CI/CD
npm i -D gh-pages
# Router
npm i react-router-dom
# Authentication
npm i firebase reactfire react-error-boundary react-google-button
# Utils
npm i date-fns uuid
```