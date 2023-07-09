<h1 style="font-size: 4rem; text-align: center;">Space Oddity Cards Game</h1>

<div align="center">

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D%2012.0.0-brightgreen.svg)](https://nodejs.org/)
[![Socket.io Version](https://img.shields.io/badge/socket.io-4.3.2-orange.svg)](https://socket.io/)
[![Express Version](https://img.shields.io/badge/express-4.17.1-red.svg)](https://expressjs.com/)
[![codecov](https://codecov.io/gh/emilohlund-git/space-oddity-server/branch/main/graph/badge.svg?token=09SD0O77RV)](https://codecov.io/gh/emilohlund-git/space-oddity-server)

</div>

<img src="./white-bh.png" style="height: 250px; width: 100%; object-fit: cover"/>
<hr/>

# 🚀 Introduction

Welcome to the **Space Oddity** Card Game Server! This server provides a functional real-time API for the graphical representation of the Space Oddity card game. It enables seamless communication between the client application and the server, allowing multiple players to participate and enjoy the game in real-time.

# 🎮 Game Rules

Space Oddity is a thrilling card game where your objective is to be the first player to run out of cards. Beware of the dreaded "black hole" card, as the last player holding it at the end of the game will lose! The game features various unique card types that introduce exciting gameplay mechanics, including card switching, deck swapping, and deck peeking.

For a complete set of game rules and instructions, please refer to the official [Space Oddity Rules](https://your-rules-url.com) document.

# ⭐️ Gameplay Overview

1. The dealer distributes the cards to all players.
2. The game progresses through three distinct phases: the red light phase, the pair matching and discarding phase, and the final card drawing phase.
3. During the pair matching phase, players strive to form pairs and discard them from their decks.
4. In the final card drawing phase, players take turns drawing a card from their left neighbor's deck, aiming to form new pairs and discard them.
5. The game continues until all pairs are formed, leaving only one card—the "black hole" card.
6. Players who successfully discard all their cards emerge as winners, while the unfortunate player left with the "black hole" card will face defeat.

Please consult the official game rules for a more detailed description of the gameplay mechanics.

# 🔧 Technologies Used

The **Space Oddity** Card Game Server leverages the following technologies:

- [Node.js](): Server-side JavaScript runtime environment.
- [Socket.io](): Library for real-time, bidirectional communication between clients and the server.
- [Express](): Web framework for handling server routes and requests.

# 📄 License

This project is licensed under the [MIT License](https://opensource.org/licenses/MIT).

# 🙌 Credits

The Space Oddity card game and its official instructions are credited to the original creator [Sirine Harzallah](https://sirine.online). Special thanks to them for providing an enjoyable gaming experience.

<hr/>

Made with ❤️ by [Emil Ölund](https://emilohlund.dev)
