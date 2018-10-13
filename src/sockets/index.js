import { Socket } from 'phoenix';

const PUB = 'game_pub';
const SUB = 'game_sub';

export default class Handler {
  constructor(channel = 'room:game') {
    const smache = process.env.NODE_ENV === 'production'
      ? 'wss://thawing-reef-15819.herokuapp.com/socket'
      : 'ws://localhost:4000/socket';
    
    const socket = new Socket(smache, {});

    socket.connect();

    this.channel = (() => socket.channel(channel))();
  }

  pub = data => this.channel.push(PUB, data);

  sub = data => this.channel.push(SUB, data);

  onPub = cb => this.channel.on(PUB, cb);

  onSub = cb => this.channel.on(SUB, cb);
}
