import type { Article, Church, Resource, Sermon } from '../data/content';
import { ARTICLES, CHURCHES, RESOURCES, SERMONS } from '../data/content';
import { apiBaseUrl, supabase } from './supabase';
import { publicAnonKey } from '../../utils/supabase/info';

export type ContentMap = {
  articles: Article;
  sermons: Sermon;
  resources: Resource;
  churches: Church;
};

export type Collection = keyof ContentMap;

/**
 * Todas las peticiones envían Authorization:
 * - Rutas públicas (authenticated=false): anon JWT para cumplir el gateway.
 * - Rutas admin (authenticated=true): access_token de la sesión activa.
 *
 * La publicAnonKey es un JWT Supabase legacy (eyJ…), válido como Bearer anon.
 * No es una publishable key (sb_publishable_…), por lo que usarla así es correcto.
 */
async function request<T>(path: string, options: RequestInit = {}, authenticated = false): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');

  if (authenticated) {
    const { data } = await supabase.auth.getSession();
    if (!data.session) throw new Error('Tu sesión expiró. Iniciá sesión nuevamente.');
    headers.set('Authorization', `Bearer ${data.session.access_token}`);
  } else {
    headers.set('Authorization', `Bearer ${publicAnonKey}`);
  }

  const response = await fetch(`${apiBaseUrl}${path}`, { ...options, headers });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || payload.message || 'Ocurrió un error inesperado.');
  return payload;
}

export async function getContent<K extends Collection>(collection: K): Promise<ContentMap[K][]> {
  const result = await request<{ items: ContentMap[K][] }>(`/content/${collection}`);
  return result.items;
}

export async function seedContent(): Promise<void> {
  await request('/admin/seed', {
    method: 'POST',
    body: JSON.stringify({ articles: ARTICLES, sermons: SERMONS, resources: RESOURCES }),
  }, true);
}

export async function createContent<K extends Collection>(
  collection: K,
  item: Omit<ContentMap[K], 'id'>,
): Promise<ContentMap[K]> {
  const result = await request<{ item: ContentMap[K] }>(`/admin/content/${collection}`, {
    method: 'POST',
    body: JSON.stringify(item),
  }, true);
  return result.item;
}

export async function updateContent<K extends Collection>(
  collection: K,
  id: string,
  item: ContentMap[K],
): Promise<ContentMap[K]> {
  const result = await request<{ item: ContentMap[K] }>(`/admin/content/${collection}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(item),
  }, true);
  return result.item;
}

export async function deleteContent(collection: Collection, id: string): Promise<void> {
  await request(`/admin/content/${collection}/${id}`, { method: 'DELETE' }, true);
}
