# tixy-rpi-led-panel

Running the excellent tixy.land on an LED panel off a Raspberry Pi. Huge credit to Alex Eden for the wonderful rpi-led-matrix library that made this whole project a delight and a breeze to work on.

![example](https://thumbs.gfycat.com/MemorableRegalAmphiuma-size_restricted.gif) 

[Better quality gif](https://gfycat.com/memorableregalamphiuma)

# Setup

You will need to setup your Raspberry Pi and LED Panel to work using hzeller's rpi-rgb-led-matrix library: https://github.com/hzeller/rpi-rgb-led-matrix

Use a Raspberry Pi 4. I started out this project using a Pi 2 and it got less than 1 FPS. Upgraded to the Pi 4 and it gets 120+ FPS. The 3 might be okay, I'm not sure.


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


# Configuration

Modify src/_config.js to suit your needs. See https://github.com/alexeden/rpi-led-matrix#configuration for information on that config.


# Running 

All of these use sudo to run as root :D

### Running in current terminal

npm start

### Running in tmux background session

npm run start-background

### Connecting to tmux background session

npm run attach-background

### Killing tmux background session

npm run kill-background




## TODO
CLI that allows:

* ~~Go to next~~  
* ~~Go to random~~  
* ~~Adjust brightness~~  
* ~~Set skip interval~~  
* ~~Set speed~~  
* ~~Input your own~~  
* ~~Save your own to a my_functions.json or similar~~  
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

Fix cursor when creating own function
