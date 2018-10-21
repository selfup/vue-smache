<template>
  <div>
      <div class="img-wrapper">
        <img
          src="https://unsplash.it/600/600"
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
import lspi from 'lspi';
import Handler from './sockets';
import Player from './components/Player.vue';

export default {
  name: 'app',
  components: {
    Player,
  },
  data() {
    const id = lspi.get('id') || new Date().getTime();

    lspi.set('id', id);

    const socket = new Handler();

    socket.channel.join();

    return {
      id,
      socket,
      players: [],
      collision: false,
    };
  },
  created() {
    window.addEventListener('keydown', e => this.handleKeyMoves(e));

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
    updatePlayerData({ data }) {
      let players;

      if (!data) {
        players = [];
      } else {
        players = data.players;
      }

      const id = this.id;
      const me = players.find(pl => pl.id === id);

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

        const entities = players.filter(pl => pl.id !== id);

        entities.push(me);

        this.players = entities;
      }
    },
    handleKeyMoves({ keyCode }) {
      requestAnimationFrame(() => {
        if (keyCode < 37 || keyCode > 40) {
          return null;
        } else {
          this.collision = false;
        }

        const horizontalVelocity = 0.5;
        const verticalVelocity = 0.9;

        const id = this.id;
        const me = this.players.find(pl => pl.id === id);

        switch (keyCode) {
          case 37:
            me.x -= horizontalVelocity;
            break;
          case 38:
            me.y -= verticalVelocity;
            break;
          case 39:
            me.x += horizontalVelocity;
            break;
          case 40:
            me.y += verticalVelocity;
            break;
        }

        const { players } = this;

        this.socket.pub({
          body: {
            key: 1,
            data: {
              players,
            },
          },
        });
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
