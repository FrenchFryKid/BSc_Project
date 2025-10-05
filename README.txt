There are two variants: Compressed and Non-Compressed
Compressed contains the code for outputting images using the Neural Network to predict compression scales
Non-Compressed outputs images without compressing

To access the code, Webpack must be installed. Open CMD inside either the Compressed or Non-Compressed folder. 
Then, type npm run start

####DIRECTORIES####
Non-Compressed Variant and Compressed Variant are similar with minor changes in the settings, so descriptions for directories apply for both

dist folder contains the bundled output from webpack

node_modules contain all the node_modules used for this project

src folder contains the main coding. Excel contains the dataset used, images contain testing images, model was a folder originally containing the neural network but is no longer used. index.html, index.js and style.css are the three main files containing code. 

.gitattributes file is used for GitHub
package.json and package-lock.json is used for npm to cross check node modules being used

webpack.config.js is the main config file for webpack bundling
webpack2.config.js is the backup file for the config, which is not actively used