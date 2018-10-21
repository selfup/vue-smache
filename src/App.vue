<template>
  <div>
    <div class="img-wrapper">
      <img
        src="https://unsplash.it/400/400"
      />
      <Player
        v-for="player in players"
        :key="player.id"
        :player="player"
        :myId="id"
        :collision="player.id === id ? collision : false"
      />
    </div>
  </div>
</template>

<script>
import _each from 'lodash/each';
import lspi from 'lspi';
import Handler from './sockets';
import Player from './components/Player.vue';
import { keyFuncs, keyMap } from './movement/player';

export default {
  name: 'app',
  components: {
    Player,
  },
  data() {
    const id = lspi.get('id') || new Date().getTime();

    lspi.set('id', id);

    const socket = new Handler();

    return {
      id,
      socket,
      keyMap,
      keyFuncs,
      players: [],
      collision: false,
    };
  },
  created() {
    this.socket.channel.join();

    window.addEventListener('keydown', e => this.handleDownKeys(e));
    window.addEventListener('keyup', e => this.handleUpKeys(e));

    this.socket.onSub(({ sub, pub }) => {
      sub ? this.updatePlayerData(sub) : this.updatePlayerData(pub);
    });

    this.socket.sub({ body: { key: 1 } });
  },
  methods: {
    createPlayer() {
      return {
        id: this.id,
        x: Math.random() * 100,
        y: Math.random() * 100,
      };
    },
    findIdAndSelf(players) {
      const id = this.id;
      const me = players.find(pl => pl.id === id);

      return {
        id,
        me,
      };
    },
    updatePlayerData({ data }) {
      let players;

      if (!data) {
        players = [];
      } else {
        players = data.players;
      }

      const { id, me } = this.findIdAndSelf(players);

      if (!me) {
        players.push(this.createPlayer());

        this.players = players;

        this.socket.pub({
          body: {
            key: 1,
            data: {
              players,
            },
          },
        });
      } else {
        this.handlePositioning(id, me, players);
      }
    },
    playerCollisionDetection(me) {
      this.collision = false;

      this.players.forEach(pl => {
        if (pl.id === me.id) {
          return null;
        }

        const dx = me.x - pl.x;
        const dy = me.y - pl.y;

        const radius = 10;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < radius) {
          this.collision = true;
        }
      });
    },
    handlePositioning(id, me, players) {
      this.playerCollisionDetection(me);

      const entities = players.filter(pl => pl.id !== id);

      entities.push(me);

      this.players = entities;
    },
    handleMovement() {
      const { me } = this.findIdAndSelf(this.players);

      _each(this.keyMap, (keyValue, keyNumber) => {
        if (keyValue) {
          this.keyFuncs(me, keyNumber);
        }
      });
    },
    handleUpKeys(e) {
      this.keyMap[e.keyCode] = false;

      this.handleMovement();
    },
    handleDownKeys(e) {
      this.keyMap[e.keyCode] = true;

      this.handleMovement();

      this.socket.pub({
        body: {
          key: 1,
          data: {
            players: this.players,
          },
        },
      });
    },
  },
};
</script>

<style>
body {
  margin: 0;
}

body > div {
  display: flex;
  width: 100%;
  min-height: 100vh;
  background: #f2f2f2;
}

.img-wrapper {
  position: relative;
  max-width: 80%;
  margin: auto;
  border: 1rem solid #fff;
  background-color: white;
}

.img-wrapper > img {
  display: block;
  max-width: 100%;
}

.player {
  position: absolute;
  transform: translate(-50%, -50%);
}

.dialogue {
  color: white;
  text-shadow: 1px 1px black;
  margin: 0;
  z-index: 100;
}

.dialogue-box {
  background-color: grey;
  width: 100px;
  border: 1px solid black;
  padding: 5px;
}
</style>
