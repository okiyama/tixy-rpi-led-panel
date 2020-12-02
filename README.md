# tixy-rpi-led-panel

Running the excellent tixy.land on an LED panel off a Raspberry Pi


# Installation  

Install Raspberry Pi OS, I used the lite version

sudo apt update && sudo apt upgrade

install nvm:

https://github.com/nvm-sh/nvm#install--update-script

Use unofficial builds to install node and npm:

https://gist.github.com/davps/6c6e0ba59d023a9e3963cea4ad0fb516

AKA add this to .bashrc, before nvm is loaded

export NVM_NODEJS_ORG_MIRROR=https://unofficial-builds.nodejs.org/download/release

Then, after restarting session so nvm runs, you can

nvm ls-remote to see what's available and nvm install v14.10.0 (or whatever, I forget which version I used. It was the v14 LTS one) to install

then npm install in the directory

Disable raspberry pi audio with sudo vim /boot/config.txt and add dtparam=audio=off to the bottom then reboot


## Running 

### Running in current terminal

sudo npm start

### Running in tmux background session

sudo npm run start-background

### Connecting to tmux background session

sudo npm run attach-background

### Killing tmux background session

sudo npm run kill-background




## TODO
CLI that allows:

* ~~Go to next~~  
* ~~Go to random~~  
* Adjust brightness  
* Set skip interval  
* Set speed  
* ~~Input your own~~  
* Save your own to a my_functions.json or similar  
* Save to favorites  
* Set colors (rainbow would be cool)   
* Set speed / brightness per example  
* ~~Toggle centering fix~~

~~Fix centering (may be hard) (or do it for individual examples)~~

~~Fix i variable~~

~~Load up internet_examples~~

~~Fix evaluation, should use with(Math)~~

~~Add npm start script~~

~~Normalize values to -1 -> +1~~
