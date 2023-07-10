<div align="center">
<h1 style="font-size: 4rem;">Space Oddity Cards Game</h1>

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D%2018.16.0-brightgreen.svg)](https://nodejs.org/)
[![Socket.io Version](https://img.shields.io/badge/socket.io-4.7.1-orange.svg)](https://socket.io/)
[![Express Version](https://img.shields.io/badge/express-4.18.2-red.svg)](https://expressjs.com/)
[![codecov](https://codecov.io/gh/emilohlund-git/space-oddity-server/branch/main/graph/badge.svg?token=09SD0O77RV)](https://codecov.io/gh/emilohlund-git/space-oddity-server)

</div>

<img src="https://sirine.fly.dev/api/files/xwaj66ih9a3b7h5/og3amxyxw6c12k2/white_bh_A4yrhkVkqc.png?token=" style="height: 250px; width: 100%; object-fit: cover"/>
<hr/>

# 🚀 Introduction

Welcome to the **Space Oddity** Card Game Server! This server provides a functional real-time API for the graphical representation of the Space Oddity card game. It enables seamless communication between the client application and the server, allowing multiple players to participate and enjoy the game in real-time.

# 🎮 Game Rules

Space Oddity is a thrilling card game where your objective is to be the first player to run out of cards. Beware of the dreaded "black hole" card, as the last player holding it at the end of the game will lose! The game features various unique card types that introduce exciting gameplay mechanics, including card switching, deck swapping, and deck peeking.

For a complete set of game rules and instructions, please refer to the official [Space Oddity Rules](https://your-rules-url.com) document.

# ⭐️ Gameplay Overview

Space Oddity is a thrilling card game where your objective is to be the first player to run out of cards. The game features various unique card types that introduce exciting gameplay mechanics, including:

| Card             | Image                                                                                                                              | Description                                                                                                                           |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| **The Switcher** | ![The Switcher](https://sirine.fly.dev/api/files/3o8j8h3187un9r9/an9k6nb64ieufaj/9xhWCG51Xj6_sal31X3hTh.jpg?token=&thumb=250x250)  | Switches the LED light color from blue to red. Once the light is switched, the hidden red black hole ring will appear somewhere else. |
| **The Joker**    | ![The Joker](https://sirine.fly.dev/api/files/3o8j8h3187un9r9/an9k6nb64ieufaj/8ikTmGd6Wnf_vASzAIoHYP.jpg?token=&thumb=250x250)     | Allows you to switch your whole deck with the person of your choice.                                                                  |
| **Sneak a Peek** | ![Sneak a Peek](https://sirine.fly.dev/api/files/3o8j8h3187un9r9/an9k6nb64ieufaj/10p3ace2WSqi_UzhJ83SQek.jpg?token=&thumb=250x250) | Lets you look at the next person's deck of cards and pick a card of your choice.                                                      |

# 🃏 Example Gameplay

To give you a glimpse of the gameplay, here's an example of a round in the Space Oddity card game:

1. The game starts with the red light turning on, indicating the beginning of a round.

2. Each player takes turns playing cards and triggering their respective effects. For example, a player may play "The Switcher" card, causing the LED light to switch from blue to red and moving the hidden red black hole ring to a different player's deck.

3. Players strategically play cards and form pairs of the same element to discard them. For instance, a player may match two "Sneak a Peek" cards, allowing them to look at the next person's deck and select a card of their choice.

4. As the game progresses, players aim to be the first to run out of cards. Each turn brings anticipation and excitement, as the "Black Hole" card gets closer to being revealed.

5. The game ends when one or more players successfully discard all their cards. These players are declared the winners. However, the player left with the "Black Hole" card in hand is considered the loser.

The Space Oddity card game offers a unique blend of chance, strategy, and bluffing, making each round an engaging and enjoyable experience for all players involved.

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
