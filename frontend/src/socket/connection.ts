import { BASE_URL } from '@/service/base-url';
import io from 'socket.io-client'

export const socket = io(BASE_URL);