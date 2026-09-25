export const TwitchConfig = {
    clientId: "TWITCH_CLIENT_ID_REPLACE_ME",
    broadcasterId: "TWITCH_BROADCASTER_ID_REPLACE_ME"
};

let accessToken: string | null = null;

export function setTwitchAccessToken(token: string): void {
    accessToken = token;
}

export function clearTwitchAccessToken(): void {
    accessToken = null;
}

export function isTwitchConfigured(): boolean {
    return TwitchConfig.clientId !== "TWITCH_CLIENT_ID_REPLACE_ME";
}

export function isTwitchAuthenticated(): boolean {
    return accessToken !== null;
}

async function twitchRequest<T>(
    path: string
): Promise<T> {
    if (!isTwitchConfigured()) {
        throw new Error("Twitch is not configured.");
    }

    if (!accessToken) {
        throw new Error("Twitch is not authenticated.");
    }

    const response = await fetch(
        https://api.twitch.tv/helix/${path},
        {
            headers: {
                "Client-Id": TwitchConfig.clientId,
                Authorization: Bearer ${accessToken}
            }
        }
    );

    if (!response.ok) {
        throw new Error(
            Twitch API request failed: ${response.status}
        );
    }

    return await response.json() as T;
}

export interface TwitchUser {
    id: string;
    login: string;
    display_name: string;
    profile_image_url: string;
}

interface TwitchUsersResponse {
    data: TwitchUser[];
}

export async function getTwitchUser(
    login: string
): Promise<TwitchUser | null> {
    const result =
        await twitchRequest<TwitchUsersResponse>(
            users?login=${encodeURIComponent(login)}
        );

    return result.data[0] ?? null;
}

export async function getBroadcaster():
    Promise<TwitchUser | null> {
    if (
        !TwitchConfig.broadcasterId ||
        TwitchConfig.broadcasterId ===
            "TWITCH_BROADCASTER_ID_REPLACE_ME"
    ) {
        return null;
    }

    const result =
        await twitchRequest<TwitchUsersResponse>(
            users?id=${encodeURIComponent(
                TwitchConfig.broadcasterId
            )}
        );

    return result.data[0] ?? null;
}
