import * as firebase from 'firebase';
import Config from './config';

const app = firebase.initializeApp(Config);

export default app;