import path from 'node:path';

const ROOT_DIR = process.cwd();

export const CONFIG_PATH = path.join(ROOT_DIR, 'static', 'region.json');

export const EXAMPLE_CONFIG_PATH = path.join(ROOT_DIR, 'static', 'region.example.json');

export const STATIC_DIR = path.join(ROOT_DIR, 'static', 'static');

export const VALID_TYPES = ['chatbot', 'site', 'miniApp', 'form', 'channel'];

export const VALID_IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.svg', '.webp'];
