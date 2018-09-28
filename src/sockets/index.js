import { Socket } from 'phoenix';

const PUB = 'game_pub';
const SUB = 'game_sub';

export default class Handler {
  constructor(channel = 'room:game') {
    const socket = new Socket('ws://localhost:4000/socket', {});

    socket.connect();

    this.channel = (() => socket.channel(channel))();
  }

  pub = data => this.channel.push(PUB, data);

  sub = data => this.channel.push(SUB, data);

  onPub = cb => this.channel.on(PUB, cb);

  onSub = cb => this.channel.on(SUB, cb);
}
