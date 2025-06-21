import { BASE_URL } from '@/constants/base-url';
import io from 'socket.io-client'

export const socket = io(BASE_URL);