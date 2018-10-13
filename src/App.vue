<template>
  <div>
      <div class="img-wrapper">
        <img
          src="https://unsplash.it/960/600"
        />
        <players
          v-for="(player, number) in players"
          :key="number"
          :player="player"
        />
      </div>
    </div>
</template>

<script>
import lspi from 'lspi';
import Handler from './sockets';
import Players from './components/Players.vue'

export default {
  name: 'app',
  components: {
    Players
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
    };
  },
  created() {
    window.addEventListener('keydown', (e) => this.handleKeyMoves(e));

    this.socket.onSub(({ sub, pub }) => {
      requestAnimationFrame(() => {
        this.handleSubStream(sub);
        this.handlePubStream(pub);
      });
    });

    this.socket.sub({ body: { key: '1' } });
  },
  methods: {
    createPlayer() {
      return {
        id: this.id,
        x: (Math.random() * 100),
        y: (Math.random() * 100),
      };
    },
    updatePlayerState({ data: { players } }) {
      const id = this.id;

      const me = players.find(pl => pl.id === id);

      if (!me) {
        const newPlayers = [...this.players, this.createPlayer()];

        this.players = newPlayers;

        this.socket.pub({
          body: {
            key: '1',
            data: {
              players: newPlayers,
            },
          }
        });
      } else {
        this.players = [...players.filter(pl => pl.id !== id), me];
      }
    },
    handleSubStream(sub) {
      if (sub) {
        if (sub.data === null) {
          this.socket.pub({
            body: {
              key: '1',
              playerId: this.id,
              data: {
                players: [this.createPlayer()],
              },
            }
          });
        } else {
          this.updatePlayerState(sub);
        }
      }
    },
    handlePubStream(pub) {
      if (pub) {
        if (pub.data.players.length) {
          this.updatePlayerState(pub);
        } else {
          const players = [this.createPlayer()];
  
          this.socket.pub({
            body: {
              key: '1',
              data: {
                players,
              },
            }
          });
        }
      }
    },
    handleKeyMoves({ keyCode }) {
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
          key: '1',
          data: {
            players,
          },
        }
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
  width: 0;
  height: 0;
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
