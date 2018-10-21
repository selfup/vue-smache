<template>
  <svg class="player" :style="ratioStyle" width="60" height="60" viewBox="1 10 78 58">
    <polygon :style="polygonStyle" :points="points"></polygon>
  </svg>
</template>

<script>
import { TweenLite } from 'gsap/TweenLite';

const Player = {
  name: 'player',
  props: {
    player: {
      required: true,
      type: Object,
    },
    myId: {
      required: true,
      type: Number,
    },
    collision: {
      required: false,
      default: false,
      type: Boolean,
    },
  },
  data() {
    const defaultSides = 40;
    const stats = Array.from({ length: defaultSides }, () => 100);

    const fill = this.player.id === this.myId ? 'cyan' : 'lightcoral';

    const polygonStyle = {
      fill,
    };

    return {
      stats,
      points: generatePoints(stats),
      sides: defaultSides,
      polygonStyle,
      minRadius: 15,
      interval: null,
      updateInterval: 300,
    };
  },
  computed: {
    ratioStyle() {
      const { player } = this;

      const randomColor =
        '#' + Math.floor(Math.random() * 16777215).toString(16) + 'f0';
      const backgroundColor = this.collision ? randomColor : '';

      return {
        backgroundColor,
        left: `${player.x}%`,
        top: `${player.y}%`,
      };
    },
  },
  polygonStyle() {},
  watch: {
    sides(newSides, oldSides) {
      const sidesDifference = newSides - oldSides;

      if (sidesDifference > 0) {
        for (let i = 1; i <= sidesDifference; i++) {
          this.stats.push(this.newRandomValue());
        }
      } else {
        const absoluteSidesDifference = Math.abs(sidesDifference);

        for (let i = 1; i <= absoluteSidesDifference; i++) {
          this.stats.shift();
        }
      }
    },
    stats(newStats) {
      TweenLite.to(this.$data, this.updateInterval / 1000, {
        points: generatePoints(newStats),
      });
    },
    updateInterval() {
      this.resetInterval();
    },
  },
  mounted() {
    this.resetInterval();
  },
  methods: {
    randomizeStats() {
      this.stats = this.stats.map(() => this.newRandomValue());
    },
    newRandomValue() {
      return Math.ceil(this.minRadius + Math.random() * (100 - this.minRadius));
    },
    resetInterval() {
      clearInterval(this.interval);
      this.randomizeStats();

      this.interval = setInterval(() => {
        this.randomizeStats();
      }, this.updateInterval);
    },
  },
};

function valueToPoint(value, index, total) {
  const x = 0;
  const y = -value * 0.35;

  const angle = ((Math.PI * 2) / total) * index;

  const cos = Math.cos(angle);
  const sin = Math.sin(angle);

  const tx = x * cos - y * sin + 40;
  const ty = x * sin + y * cos + 40;

  return { x: tx, y: ty };
}

function generatePoints(stats) {
  const total = stats.length;

  return stats
    .map((stat, index) => {
      const point = valueToPoint(stat, index, total);

      return point.x + ',' + point.y;
    })
    .join(' ');
}

export default Player;
</script>

<style scoped=true>
svg {
  display: inline-block;
  border-radius: 50px;
}

polygon {
  fill: cyan;
  stroke: black;
}
</style>
