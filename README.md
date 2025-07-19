# Aethrakor 3: Return to Ashes by Tim Trott

## Introduction

This project began as an ambitious attempt to create a fully featured dungeon crawler game using the [Phaser](https://phaser.io) framework. However, it quickly became clear that I had a lot to learn about game programming, Phaser’s architecture, and the many systems that go into making a successful game. Instead of diving headfirst into something too complex, I decided to take a step back and build a smaller, self-contained game — one that would let me explore key Phaser concepts in a practical, hands-on way.

**This game was never originally meant to be released.** It started purely as a learning exercise: a way to understand game loops, state management, scene transitions, sprite handling, sound integration, and more. But as development progressed, the project grew into something surprisingly fun and engaging. The systems became more refined, the art and sound more cohesive, and the gameplay more balanced — until, eventually, it felt like a real game worth sharing.

### ✨ Inspiration

The game draws heavy inspiration from mobile collectible card games (CCGs), particularly *Devil Maker Tokyo* — a card battle RPG that blended dark fantasy, turn-based combat, and collectible mechanics into a compelling experience. Sadly, that game has since been discontinued, but its spirit lives on here.

This project helped me:

* Learn how to structure a Phaser game into reusable scenes and managers
* Understand how to manage game data, card collections, battles, and UI
* Design engaging progression systems and integrate audio and animation
* Explore game balance, pacing, and player experience design

While it's not a dungeon crawler, it lays the groundwork for one — and represents the first successful milestone on a much bigger journey into game development.

## 🚀 Getting Started

➡️ The best way to play this game is to play online at [TimTrottCodes](https://timtrottcodes.pages.dev/).

To run the game locally:

1. **Clone the repository**

   ```bash
   git clone https://github.com/timtrottcodes/aethrakor-3
   cd aethrakor-3
   ```

2. **Install dependencies**
   This game uses modern JavaScript/TypeScript bundling. You may need to install:

   ```bash
   npm install
   ```

3. **Start the development server**

   ```bash
   npm run dev
   ```

4. **Open the game in your browser**
   Navigate to [http://localhost:3000](http://localhost:3000) or whatever port your dev server reports.

> 📱 The game is designed for a mobile resolution of **720x1280**, but it can be played in desktop browsers as well.


## 🃏 How to Play

***Welcome to your adventure!*** In this game, you will build a powerful deck of cards and face dangerous enemies in a turn-based journey through dark lands, culminating in a final battle against the Lich King to rescue the princess. Strategy, progression, and smart deck-building are key to your success.

### 🎮 Game Overview

* You start the game with **8 random cards**, from which **5 are automatically chosen** as your starter deck.
* As you progress, you will **discover new cards** and unlock the **deck builder**, allowing you to construct your own powerful custom deck.
* The game consists of **10 chapters**, each split into **5 stages** for a total of 50.
* Each stage is made up of several steps and ends with a **combat encounter** or reward.
* Victory in battles and smart card choices will help you collect more cards and level up.

### 🔍 Stage Flow

Each stage contains an **exploration phase** that plays out like a narrative journey:

1. **Choose a Card:**
   In each step, you're presented with **three random cards**. You must choose one.

2. **Card Effects:**
   The card you choose may:

   * **Advance to the next step**
   * **Trigger an encounter (combat)**
   * **Grant a new card** to your collection

3. **Combat Encounters:**
   If you trigger combat, the following happens:

   * A group of **enemy monsters** appears.
   * Your selected **deck of 5 cards** is used in turn-based combat.
   * Combat is **automated**, but outcomes depend on card stats, abilities, and matchups.

### ⚔️ Combat Mechanics

* Combat is **turn-based**. The player always goes **first**.
* Each card in your deck faces off against one enemy in the opposing lineup.
* **Attack**, **Health**, and **Special Abilities** determine performance.
* Damage is calculated per turn until one side is defeated.
* Winning a combat may reward you with a **new card** added to your collection.

### 🧩 Deck Building

Once unlocked, the **deck builder** allows you to:

* View your full collection of discovered cards.
* Choose **exactly 5 cards** to form your active deck.
* Each card has a **cost**, and your deck must not exceed your current **total cost limit**.

**Tip:** Choose the **strongest cards** that fit within your available points!

#### 💡 Deck Cost System

* At **Level 1**, you start with **5 points** of deck cost.
* As you complete stages and gain experience, you **level up**, increasing your max deck cost.
* The cost system ensures balance and adds a layer of strategy to deck construction.

### 🗺️ Progression

* You level up by **completing stages** and **winning battles**.
* Each level increases your **deck building limit**, allowing for stronger or more cards.
* **Later stages** contain tougher enemies, so building a better deck is essential.

### 📈 Leveling and Card Discovery

* The more you play, the more cards you’ll unlock.
* Cards vary in **rarity** and **power**, with some offering **unique abilities** or **synergy** with others.
* Completing combat encounters or optional battles grants **new cards** to your collection.

### 🌀 Random Battle Mode

If you're stuck or want to grind for cards:

* Use the **“Random Battle”** option on the main menu.
* Fight a **random encounter** outside the story.
* Win for a **higher chance** to gain an additional card.

Use this mode to power up before tackling harder stages!

### 📚 Collection

* The **Collection** screen lets you view all cards you've unlocked.
* Unowned cards appear with their backs, so you know how many are still missing.
* Collecting all cards is optional, but offers a fun completionist goal!

### 📜 Summary

| Feature              | Description                                              |
| -------------------- | -------------------------------------------------------- |
| 🔄 Stage Progression | Choose cards → explore → fight or collect                |
| 🃏 Deck Builder      | Build a 5-card deck under a total cost limit             |
| ⚔️ Combat            | Turn-based auto-battles based on card stats and strategy |
| 🎁 Card Discovery    | Earn new cards from exploration and combat               |
| 📈 Leveling          | Unlock higher total cost limits to use stronger cards    |
| 🔁 Random Battle     | Optional mode to earn new cards and test your deck       |
| 📚 Card Collection   | Track your card progress and rarity                      |

### 🧠 Tips for New Players

* Focus on **high-value low-cost cards** early in the game.
* Use Random Battle mode to **grow your collection quickly**.
* If a card doesn't work well in combat, try something new!
* Keep checking the deck builder as you **level up** — your points cap increases.
* Learn enemy patterns to prepare stronger counter-decks in future stages.

### 🏁 Victory Awaits

By the end of the game, you will:

* Travel through haunted forests, cursed wastelands, and forgotten castles
* Defeat powerful enemies and bosses
* Build a legendary deck
* Face off against the Lich King and **rescue the princess**


## Assets
All the graphics in the game were generated using [Stable Diffusion GenAI](https://github.com/AUTOMATIC1111/stable-diffusion-webui).

All music genereated using [AudioCraft GenAI](https://github.com/facebookresearch/audiocraft)

The original generated assets along with prompts and generation info can be found in the src/assets folder.

Additional sound effects: 

* Combat Claw [Image by freepik](https://www.freepik.com/free-vector/tiger-claws-mark-background_3489512.htm#fromView=keyword&page=1&position=1&uuid=b34635a6-3742-49a7-b5cc-39c3174f6510&query=Claw+Marks)
* Star [Image by freepik](https://www.freepik.com/free-psd/realistic-light-collection_408597480.htm#fromView=keyword&page=1&position=2&uuid=3b0ddf7d-c55b-4851-8d84-f45bf7722946&query=Shining+Star+Png) <a href=""></a>
* Button click Sound Effect by [freesoundeffects on Pixabay](https://pixabay.com/users/freesoundeffects-48326557/?utm_source=link-attribution&utm_medium=referral&utm_campaign=music&utm_content=289742)
* Footstep Sound Effect by [Diego Nasc on Pixabay](https://pixabay.com/users/data_pion-49620193/?utm_source=link-attribution&utm_medium=referral&utm_campaign=music&utm_content=323055)
* Horn Sound Effect by [freesound_community on Pixabay](https://pixabay.com/users/freesound_community-46691455/?utm_source=link-attribution&utm_medium=referral&utm_campaign=music&utm_content=44005)
* Fanfare Sound Effect by [freesound_community on Pixabay](https://pixabay.com/users/freesound_community-46691455/?utm_source=link-attribution&utm_medium=referral&utm_campaign=music&utm_content=6185)
* Punch Sound Effect by [Universfield on Pixabay](https://pixabay.com/users/universfield-28281460/?utm_source=link-attribution&utm_medium=referral&utm_campaign=music&utm_content=140236)
* Sword Sound Effect by [freesound_community on Pixabay](https://pixabay.com/users/freesound_community-46691455/?utm_source=link-attribution&utm_medium=referral&utm_campaign=music&utm_content=95566)
* Tear Sound Effect by [Aman Kumar on Pixabay](https://pixabay.com/users/tanweraman-29554143/?utm_source=link-attribution&utm_medium=referral&utm_campaign=music&utm_content=252617)
* Success Sound Effect by [freesound_community on Pixabay](https://pixabay.com/users/freesound_community-46691455/?utm_source=link-attribution&utm_medium=referral&utm_campaign=music&utm_content=82815)
* Defeat Sound Effect by [Eiklo on Pixabay](https://pixabay.com/users/eiklo-41248033/?utm_source=link-attribution&utm_medium=referral&utm_campaign=music&utm_content=303896)
Here is the updated section for your `README.md` to reflect the use of **Google Analytics** in the online version, while remaining clear about the self-hosted privacy:

## 🛡️ Data Storage & Privacy

This game uses **local storage** to save essential gameplay data such as your current progress, deck selections, and collected cards. This ensures that your game picks up right where you left off without needing an account or login.

### 🔒 Local Game Data

* ✅ **Auto-Saved Progress**: Your progress is automatically saved using your browser’s local storage.
* 🚫 **No Cookies or Tracking (Self-Hosted Version)**: If you download or host the game yourself, it contains **no analytics, cookies, or tracking** of any kind.
* 🌍 **GDPR-Compliant**: All gameplay data remains entirely on your device and is never transmitted to a server.

### 🌐 Online Version

The online version of the game (hosted by me) includes **Google Analytics** to help understand how the game is being played and to improve the experience over time.

* 📊 **Anonymous Usage Data**: Google Analytics collects basic, anonymized information such as page views and device types.
* 🔍 **No Personally Identifiable Information**: No personal data is collected, and tracking is limited to gameplay behavior within the game itself.
* 🔧 **Used for Improvement Only**: The data helps guide future improvements, balance changes, and feature updates.

If you'd prefer not to be included in any analytics tracking, you may download and play the self-hosted version, which contains no Google Analytics or tracking whatsoever.

You can reset your progress at any time by clearing your browser’s local storage for this site.

## ⚖️ Legal & Licensing

This project was created for educational purposes and to explore game development using Phaser. You're welcome to **download, inspect, and run the source code locally** for personal or learning use.

However, the following restrictions apply:

* ❌ **No Rehosting**: You may not host this game or any modified version of it on third-party websites or public platforms.
* ❌ **No Mobile Apps**: You may not redistribute this game as a standalone mobile app on app stores or marketplaces.
* ❌ **No Commercial Use**: Commercial usage of any kind — including selling, monetizing, or requiring sign-ups/accounts to access the game — is strictly prohibited.
* ✅ **Personal & Educational Use Only**: You may study and adapt the code for your own personal or non-commercial learning projects.
