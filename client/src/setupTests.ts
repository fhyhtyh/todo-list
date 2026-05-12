import { TextEncoder, TextDecoder } from 'util';
import { ReadableStream, WritableStream, TransformStream } from 'stream/web';
import { BroadcastChannel, MessagePort, MessageChannel } from 'worker_threads';

Object.assign(global, {
  TextEncoder,
  TextDecoder,
  ReadableStream,
  WritableStream,
  TransformStream,
  BroadcastChannel,
  MessagePort,
  MessageChannel,
});

const undici = require('undici');
Object.assign(global, {
  fetch: undici.fetch,
  Headers: undici.Headers,
  Request: undici.Request,
  Response: undici.Response,
  FormData: undici.FormData
});

import '@testing-library/jest-dom';
