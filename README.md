<a name="readme-top"></a>


<!-- PROJECT SHIELDS -->
[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
[![MIT License][license-shield]][license-url]
[![LinkedIn][linkedin-shield]][linkedin-url]


<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a href="https://github.com/timondev/webxr-a11y">
    <img src="res/favicon.png" alt="WebXR - a11y Logo; M-Symbol in different shades of pink to orange" width="80" height="80">
  </a>

<h3 align="center">WebXR - a11y</h3>

  <p align="center">
    Accessibility Demonstration in WebXR
    <br />
    <a href="https://github.com/timondev/webxr-a11y"><strong>Explore the docs »</strong></a>
    <br />
    <br />
    <a href="https://github.com/timondev/webxr-a11y">View Demo</a>
    ·
    <a href="https://github.com/timondev/webxr-a11y/issues">Report Bug</a>
    ·
    <a href="https://github.com/timondev/webxr-a11y/issues">Request Feature</a>
  </p>
</div>



<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li><a href="#usage">Usage</a></li>
    <li><a href="#roadmap">Roadmap</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#acknowledgments">Acknowledgments</a></li>
  </ol>
</details>



<!-- ABOUT THE PROJECT -->
## About The Project

Around 4.4 percent of germans with severe disabilities are legally blind (source: [Statistisches Bundesamt, 2019](https://www.destatis.de/DE/Themen/Gesellschaft-Umwelt/Gesundheit/Behinderte-Menschen/Publikationen/Downloads-Behinderte-Menschen/sozial-schwerbehinderte-kb-5227101199004.pdf?__blob=publicationFile)). Most WebXR Applications are built without accessibility in mind. This project serves to demonstrate how to transform a WebXR Application according to WCAG 2.1, A11Y and other resources not disclosed here.

[![Product Name Screen Shot][product-screenshot]](https://webxr-a11y.tmn.dev)

This project is forked from [MozillaReality/hello-webxr](https://github.com/MozillaReality/hello-webxr). It will be used as a base for the transformation.

<p align="right">(<a href="#readme-top">back to top</a>)</p>



### Built With

[![WebGL][WebGL.com]][WebGL-url]
[![Three.js][Three.js.com]][Three.js-url]
[![Node.js][Node.js.com]][Node.js-url]
[![Webpack][Webpack.com]][Webpack-url]

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- GETTING STARTED -->
## Getting Started

To run this project please follow the steps described below. For best compatibility please use the versions of node.js and firefox as described.

### Prerequisites

To run this project you need a WebXR capable device and browser. Firefox and Chrome are preferred. Using a virtual reality device with controllers is preferred, as it will be tested on one. To run this project locally, you need to have node.js and npm (node package manager) installed on your system.

* WebXR capable browser
   
  ![Chrome] ![Edge] ![Opera] ![IE] ![Firefox] ![Safari] ![Safari-on-iOS]    
  Desktop Browsers
     
  ![Chrome-for-Android] ![Samsung-Internet] ![Android-Browser] ![Opera-Mobile] ![Firefox-for-Android]    
  Mobile Browsers

  Source: [lambdatest.com/web/technologies/webxr](https://www.lambdatest.com/web-technologies/webxr)

* node 16.13.2
  
  please download from [nodejs.org/de/blog/release/v16.13.2/](https://nodejs.org/de/blog/release/v16.13.2/) or use nvm

  ```sh
  nvm use 16
  ```
* npm 8.3.1
  
  ```sh
  npm install npm@latest -g
  ```


### Installation

1. Clone the repo
   
   ```sh
   git clone https://github.com/timondev/webxr-a11y.git
   ```
2. Install NPM packages
   
   ```sh
   cd webxr-a11y && npm install
   ```
3. Run the software, it may take some time to build
   
   ```sh
   npx webpack serve
   ```

---

The following is only needed if shaders were changed. Needs to have python installed, no extra modules for installation needed
   
```sh
python packshaders.py
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>


<!-- USAGE EXAMPLES -->
## Usage

Start by installing and running the project locally or launch the latest version by visiting [meta-a11y.tmn.dev](https://meta-a11y.tmn.dev). Click on `ENTER VR` on the bottom edge of the screen or press `space` on your keyboard. You can change the dominant hand `left` or `right` (which will be used mainly for navigation) on the top right of the screen. **this will currently refresh the page, which could change in the future**.

To exit, click on `EXIT VR` on the bottom edge of the screen inside your browser window.

### The hall

You will find yourself in a room with different stations and portals. It is called `the hall`. From the starting point across the room, slightly to the right, is a logo with the inscription `Hello WebXR!` and an alternate version of the firefox logo with googles behind the exclamation point.

Between you and the logo are 360 degree image orbs floating above two pylons and a xylophone which you are able to play on using your controllers. To the right of the starting point are paintings where you can use a magnifying glass to zoom in and out while near. To the left of the logo is a portal which leads to the room called `vertigo`. To the left of the starting point is a news feed from twitter, followed by another portal which leads to a room called `photogrammetry-object`. behind the starting point is a big drawing canvas and the last portal which leads to a room called `sound`.

To interact with a portal, use your dominant controller to select the portal and hit your main trigger to enter it.

### Vertigo

The room vertigo consists of different sized tall boxes and a small path leading into the void. The room has no solid floor. To go back, you need to turn around and find your way through a small passage where you can exit via the portal to the left.

### Photgrammetry-Object

The room has a detailed version of an angle statue and a tablet with information about history. The portal is behind your back from the starting point. You will hear classical music while you are in this room.

### Sound

The room will play different sounds around you. To go back, exit via the portal to the right of the starting point.

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- ROADMAP -->
## Roadmap

- [ ] Add Hello WebXR example to project
- [ ] Add metadata to assets
  - [ ] Information about textures, dexteritity and size
  - [ ] Compound Information about larger assets
- [ ] Add screen reader capabilities
  - [ ] Enable screen reader using an action button
  - [ ] Identify objects in viewpoint
  - [ ] Mark position of objects of interest on screen
  - [ ] Use metadata to read information and position about objects aloud
- [ ] Add navigation features
  - [ ] Identify objects in viewpoint (and or inside room)
  - [ ] List objects in viewpoint to user using screen reader
  - [ ] Selection of an object inside viewpoint
  - [ ] Interaction or teleportation to object using action button

See the [open issues](https://github.com/timondev/webxr-a11y/issues) for a full list of proposed features (and known issues).

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- CONTRIBUTING -->
## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".
Don't forget to give the project a star! Thanks again!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m ':sparkles: Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- LICENSE -->
## License

Distributed under the Apache-2.0 License. See `LICENSE` for more information.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- ACKNOWLEDGMENTS -->
## Acknowledgments

* [Hello WebXR! by mozilla](https://github.com/MozillaReality/hello-webxr)
* [ReadME Template by Othneil Drew](https://github.com/othneildrew/Best-README-Template)

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->
[contributors-shield]: https://img.shields.io/github/contributors/timondev/webxr-a11y.svg?style=for-the-badge
[contributors-url]: https://github.com/timondev/webxr-a11y/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/timondev/webxr-a11y.svg?style=for-the-badge
[forks-url]: https://github.com/timondev/webxr-a11y/network/members
[stars-shield]: https://img.shields.io/github/stars/timondev/webxr-a11y.svg?style=for-the-badge
[stars-url]: https://github.com/timondev/webxr-a11y/stargazers
[issues-shield]: https://img.shields.io/github/issues/timondev/webxr-a11y.svg?style=for-the-badge
[issues-url]: https://github.com/timondev/webxr-a11y/issues
[license-shield]: https://img.shields.io/github/license/timondev/webxr-a11y.svg?style=for-the-badge
[license-url]: https://github.com/timondev/webxr-a11y/blob/master/LICENSE.txt
[linkedin-shield]: https://img.shields.io/badge/-LinkedIn-black.svg?style=for-the-badge&logo=linkedin&colorB=555
[linkedin-url]: https://linkedin.com/in/timon-linke-190ba8195
[product-screenshot]: assets/main-screenshot.jpg

<!-- SHIELD LINKS & IMAGES -->
[WebGL.com]: https://img.shields.io/badge/webgl-0769AD?style=for-the-badge&logo=WebGL&color=red&logoColor=white
[WebGL-url]: https://get.webgl.org/
[Three.js.com]: https://img.shields.io/badge/three.js-0769AD?style=for-the-badge&logo=Three.js&color=white&logoColor=black
[Three.js-url]: https://threejs.org/
[Node.js.com]: https://img.shields.io/badge/node.js-0769AD?style=for-the-badge&logo=Node.js&color=green&logoColor=white
[Node.js-url]: https://nodejs.org/
[Webpack.com]: https://img.shields.io/badge/webpack-0769AD?style=for-the-badge&logo=Webpack&color=blue&logoColor=white
[Webpack-url]: https://webpack.js.org/

<!-- COMPATIBILITY SCORE -->
[IE]: https://img.shields.io/badge/ie-0769AD?style=for-the-badge&logo=Internet%20Explorer&color=red&logoColor=white
[Edge]: https://img.shields.io/badge/edge-0769AD?style=for-the-badge&logo=Microsoft%20Edge&color=green&logoColor=white
[Firefox]: https://img.shields.io/badge/firefox-0769AD?style=for-the-badge&logo=Firefox%20Browser&color=red&logoColor=white
[Chrome]: https://img.shields.io/badge/chrome-0769AD?style=for-the-badge&logo=Google%20Chrome&color=green&logoColor=white
[Safari]: https://img.shields.io/badge/safari-0769AD?style=for-the-badge&logo=Safari&color=red&logoColor=white
[Opera]: https://img.shields.io/badge/opera-0769AD?style=for-the-badge&logo=Opera&color=orange&logoColor=white
[Safari-on-iOS]: https://img.shields.io/badge/safari--on--ios-0769AD?style=for-the-badge&logo=Safari&color=red&logoColor=white
[Android-Browser]: https://img.shields.io/badge/android--browser-0769AD?style=for-the-badge&logo=Android&color=red&logoColor=white
[Opera-Mobile]: https://img.shields.io/badge/opera--mobile-0769AD?style=for-the-badge&logo=Opera&color=orange&logoColor=white
[Chrome-for-Android]: https://img.shields.io/badge/chrome--for--android-0769AD?style=for-the-badge&logo=Google%20Chrome&color=green&logoColor=white
[Firefox-for-Android]: https://img.shields.io/badge/firefox--for--android-0769AD?style=for-the-badge&logo=Firefox%20Browser&color=red&logoColor=white
[Samsung-Internet]: https://img.shields.io/badge/samsung--internet-0769AD?style=for-the-badge&logo=Samsung&color=green&logoColor=white