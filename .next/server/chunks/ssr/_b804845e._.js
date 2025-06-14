module.exports = {

"[project]/src/app/actions.ts [app-rsc] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
/* __next_internal_action_entry_do_not_use__ {"40920e7c29b3dfb603c7542c737eef0e3fc4e28d02":"getLinkMetadata"} */ __turbopack_context__.s({
    "getLinkMetadata": (()=>getLinkMetadata)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/server-reference.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$app$2d$render$2f$encryption$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/app-render/encryption.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/action-validate.js [app-rsc] (ecmascript)");
;
;
async function getHtml(url) {
    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept': 'text/html'
            }
        });
        if (!response.ok) {
            console.error(`Failed to fetch URL: ${url}, status: ${response.status}`);
            return null;
        }
        return await response.text();
    } catch (error) {
        console.error(`Error fetching URL ${url}:`, error);
        return null;
    }
}
function getAttributeValue(attributesString, attributeName) {
    const regex = new RegExp(`${attributeName}\\s*=\\s*["']([^"']+)["']`, 'i');
    const match = attributesString.match(regex);
    return match ? match[1] : null;
}
function extractPreviewImageUrl(html, baseUrl) {
    const metaTagMatches = html.matchAll(/<meta\s+([^>]+)>/gi);
    let ogImage = null;
    let twitterImage = null;
    for (const match of metaTagMatches){
        const attrsString = match[1];
        const property = getAttributeValue(attrsString, 'property');
        const name = getAttributeValue(attrsString, 'name');
        const content = getAttributeValue(attrsString, 'content');
        if (content) {
            if (property === 'og:image' || name === 'og:image') {
                ogImage = content;
            }
            if (property === 'twitter:image' || name === 'twitter:image') {
                twitterImage = content;
            }
        }
    }
    let imageUrl = ogImage || twitterImage;
    if (imageUrl) {
        try {
            const absoluteUrl = new URL(imageUrl, baseUrl).href;
            new URL(absoluteUrl);
            return absoluteUrl;
        } catch (e) {
            console.warn(`Invalid or unresolvable preview image URL found: ${imageUrl} with base ${baseUrl}`);
            return null;
        }
    }
    return null;
}
function simpleHtmlEntityDecode(text) {
    return text.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#0*39;/g, "'").replace(/&apos;/g, "'").replace(/&nbsp;/g, ' ');
}
function extractPageTitle(html) {
    const titleRegex = /<title[^>]*>(.*?)<\/title>/i;
    const match = html.match(titleRegex);
    if (match && match[1]) {
        let titleText = match[1];
        titleText = simpleHtmlEntityDecode(titleText);
        return titleText.trim() || null;
    }
    return null;
}
function extractFaviconUrl(html, baseUrl) {
    const linkTagMatches = html.matchAll(/<link\s+([^>]+)>/gi);
    const potentialFavicons = [];
    for (const match of linkTagMatches){
        const attrsString = match[1];
        const href = getAttributeValue(attrsString, 'href');
        const rel = getAttributeValue(attrsString, 'rel');
        if (href && rel) {
            const lowerRel = rel.toLowerCase();
            if ([
                'icon',
                'shortcut icon',
                'apple-touch-icon'
            ].includes(lowerRel)) {
                potentialFavicons.push({
                    href: href,
                    rel: lowerRel,
                    type: getAttributeValue(attrsString, 'type')?.toLowerCase(),
                    sizes: getAttributeValue(attrsString, 'sizes')
                });
            }
        }
    }
    const sortedFavicons = potentialFavicons.sort((a, b)=>{
        const priority = (pf)=>{
            if (pf.rel === 'icon' && pf.type === 'image/svg+xml') return 1;
            if (pf.rel === 'icon' && pf.type === 'image/png' && pf.sizes && (pf.sizes.includes('32x32') || pf.sizes.includes('64x64'))) return 2;
            if (pf.rel === 'icon' && pf.type === 'image/png') return 3;
            if (pf.rel === 'icon') return 4;
            if (pf.rel === 'shortcut icon') return 5;
            if (pf.rel === 'apple-touch-icon') return 6;
            return 7;
        };
        return priority(a) - priority(b);
    });
    if (sortedFavicons.length > 0) {
        for (const fav of sortedFavicons){
            try {
                const absoluteUrl = new URL(fav.href, baseUrl).href;
                new URL(absoluteUrl);
                return absoluteUrl;
            } catch (e) {
            // Try next potential favicon if current one is invalid
            }
        }
        console.warn(`All potential favicon hrefs were invalid or unresolvable for base ${baseUrl}`);
    }
    return null;
}
async function /*#__TURBOPACK_DISABLE_EXPORT_MERGING__*/ getLinkMetadata(url) {
    const defaultMetadata = {
        thumbnailUrl: null,
        pageTitle: null,
        faviconUrl: null
    };
    if (!url) return defaultMetadata;
    let normalizedUrl = url;
    if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
        normalizedUrl = `https://${normalizedUrl}`;
    }
    try {
        new URL(normalizedUrl);
    } catch (e) {
        console.warn(`Invalid URL provided to getLinkMetadata after normalization: ${url}`);
        throw new Error("The provided URL is invalid. Please enter a valid URL (e.g., https://example.com).");
    }
    const html = await getHtml(normalizedUrl);
    if (!html) {
        // If HTML can't be fetched, return default metadata, perhaps with a more specific title
        return {
            ...defaultMetadata,
            pageTitle: normalizedUrl
        };
    }
    let thumbnailUrl = extractPreviewImageUrl(html, normalizedUrl);
    if (thumbnailUrl) {
        try {
            new URL(thumbnailUrl);
        } catch (e) {
            console.warn(`Invalid thumbnail URL extracted: ${thumbnailUrl}. Setting thumbnail to null.`);
            thumbnailUrl = null;
        }
    }
    const pageTitle = extractPageTitle(html);
    // This list would ideally come from next.config.js or a shared utility if it needs to be strictly enforced
    // For favicons with <img> tag, we might not need to be as strict as next/image.
    // However, to be consistent with the old "RegisteredHostnamesDialog", we keep a list here.
    const registeredHostnamesForFavicon = [
        'placehold.co',
        'i.ytimg.com',
        'cdn.dribbble.com',
        'media.cnn.com',
        'akcdn.detik.net.id',
        'awsimages.detik.net.id',
        'cdn0-production-images-kly.akamaized.net',
        'ichef.bbci.co.uk',
        'cdn.prod.website-files.com',
        'animateai.pro',
        'siteforge.io',
        'pebblely.com',
        'yastatic.net',
        'v0chat.vercel.sh',
        's.pinimg.com',
        's2.coinmarketcap.com',
        'preview-kly.akamaized.net',
        'cdn1-production-images-kly.akamaized.net',
        'sc.cnbcfm.com',
        'cdn.cnnindonesia.com',
        'www.youtube.com',
        'huggingface.co',
        'github.githubassets.com',
        'cdn.oaistatic.com',
        'flathub.org',
        'spaceberry.studio',
        'upload.wikimedia.org',
        'img.alicdn.com',
        'cdn.usegalileo.ai',
        'www.deepl.com',
        'i.pinimg.com',
        'd2.alternativeto.net',
        'osmo.b-cdn.net',
        'framerusercontent.com',
        'animejs.com',
        'peoplesgdarchive.org',
        'www.notion.so',
        'arc.net',
        'lawsofux.com',
        'naruto-official.com',
        'www.apple.com',
        'avatars.githubusercontent.com',
        'assets.bibit.id',
        'images.bareksa.com',
        'code.visualstudio.com'
    ].sort();
    let faviconUrl = extractFaviconUrl(html, normalizedUrl);
    if (faviconUrl) {
        try {
            const faviconHostname = new URL(faviconUrl).hostname;
            if (!registeredHostnamesForFavicon.includes(faviconHostname)) {
                console.warn(`Favicon hostname ${faviconHostname} not registered for favicon. Clearing favicon.`);
                faviconUrl = null;
            }
        } catch (e) {
            console.warn(`Invalid favicon URL ${faviconUrl}. Clearing favicon.`);
            faviconUrl = null;
        }
    }
    return {
        thumbnailUrl: thumbnailUrl,
        pageTitle: pageTitle,
        faviconUrl: faviconUrl
    };
}
;
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ensureServerEntryExports"])([
    getLinkMetadata
]);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(getLinkMetadata, "40920e7c29b3dfb603c7542c737eef0e3fc4e28d02", null);
}}),
"[project]/.next-internal/server/app/page/actions.js { ACTIONS_MODULE0 => \"[project]/src/app/actions.ts [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript) <locals>": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({});
;
}}),
"[project]/.next-internal/server/app/page/actions.js { ACTIONS_MODULE0 => \"[project]/src/app/actions.ts [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript) <module evaluation>": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({});
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/actions.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$next$2d$internal$2f$server$2f$app$2f$page$2f$actions$2e$js__$7b$__ACTIONS_MODULE0__$3d3e$__$225b$project$5d2f$src$2f$app$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$2922$__$7d$__$5b$app$2d$rsc$5d$__$28$server__actions__loader$2c$__ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i('[project]/.next-internal/server/app/page/actions.js { ACTIONS_MODULE0 => "[project]/src/app/actions.ts [app-rsc] (ecmascript)" } [app-rsc] (server actions loader, ecmascript) <locals>');
}}),
"[project]/.next-internal/server/app/page/actions.js { ACTIONS_MODULE0 => \"[project]/src/app/actions.ts [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript) <exports>": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "40920e7c29b3dfb603c7542c737eef0e3fc4e28d02": (()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getLinkMetadata"])
});
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/actions.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$next$2d$internal$2f$server$2f$app$2f$page$2f$actions$2e$js__$7b$__ACTIONS_MODULE0__$3d3e$__$225b$project$5d2f$src$2f$app$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$2922$__$7d$__$5b$app$2d$rsc$5d$__$28$server__actions__loader$2c$__ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i('[project]/.next-internal/server/app/page/actions.js { ACTIONS_MODULE0 => "[project]/src/app/actions.ts [app-rsc] (ecmascript)" } [app-rsc] (server actions loader, ecmascript) <locals>');
}}),
"[project]/.next-internal/server/app/page/actions.js { ACTIONS_MODULE0 => \"[project]/src/app/actions.ts [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "40920e7c29b3dfb603c7542c737eef0e3fc4e28d02": (()=>__TURBOPACK__imported__module__$5b$project$5d2f2e$next$2d$internal$2f$server$2f$app$2f$page$2f$actions$2e$js__$7b$__ACTIONS_MODULE0__$3d3e$__$225b$project$5d2f$src$2f$app$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$2922$__$7d$__$5b$app$2d$rsc$5d$__$28$server__actions__loader$2c$__ecmascript$29$__$3c$exports$3e$__["40920e7c29b3dfb603c7542c737eef0e3fc4e28d02"])
});
var __TURBOPACK__imported__module__$5b$project$5d2f2e$next$2d$internal$2f$server$2f$app$2f$page$2f$actions$2e$js__$7b$__ACTIONS_MODULE0__$3d3e$__$225b$project$5d2f$src$2f$app$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$2922$__$7d$__$5b$app$2d$rsc$5d$__$28$server__actions__loader$2c$__ecmascript$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i('[project]/.next-internal/server/app/page/actions.js { ACTIONS_MODULE0 => "[project]/src/app/actions.ts [app-rsc] (ecmascript)" } [app-rsc] (server actions loader, ecmascript) <module evaluation>');
var __TURBOPACK__imported__module__$5b$project$5d2f2e$next$2d$internal$2f$server$2f$app$2f$page$2f$actions$2e$js__$7b$__ACTIONS_MODULE0__$3d3e$__$225b$project$5d2f$src$2f$app$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$2922$__$7d$__$5b$app$2d$rsc$5d$__$28$server__actions__loader$2c$__ecmascript$29$__$3c$exports$3e$__ = __turbopack_context__.i('[project]/.next-internal/server/app/page/actions.js { ACTIONS_MODULE0 => "[project]/src/app/actions.ts [app-rsc] (ecmascript)" } [app-rsc] (server actions loader, ecmascript) <exports>');
}}),
"[project]/src/app/favicon.ico.mjs { IMAGE => \"[project]/src/app/favicon.ico (static in ecmascript)\" } [app-rsc] (structured image object, ecmascript, Next.js server component)": ((__turbopack_context__) => {

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.n(__turbopack_context__.i("[project]/src/app/favicon.ico.mjs { IMAGE => \"[project]/src/app/favicon.ico (static in ecmascript)\" } [app-rsc] (structured image object, ecmascript)"));
}}),
"[project]/src/app/layout.tsx [app-rsc] (ecmascript, Next.js server component)": ((__turbopack_context__) => {

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.n(__turbopack_context__.i("[project]/src/app/layout.tsx [app-rsc] (ecmascript)"));
}}),
"[project]/src/app/page.tsx (client reference/proxy) <module evaluation>": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>__TURBOPACK__default__export__)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2d$edge$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server-edge.js [app-rsc] (ecmascript)");
;
const __TURBOPACK__default__export__ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2d$edge$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call the default export of [project]/src/app/page.tsx <module evaluation> from the server, but it's on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/src/app/page.tsx <module evaluation>", "default");
}}),
"[project]/src/app/page.tsx (client reference/proxy)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>__TURBOPACK__default__export__)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2d$edge$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server-edge.js [app-rsc] (ecmascript)");
;
const __TURBOPACK__default__export__ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2d$edge$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call the default export of [project]/src/app/page.tsx from the server, but it's on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/src/app/page.tsx", "default");
}}),
"[project]/src/app/page.tsx [app-rsc] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$page$2e$tsx__$28$client__reference$2f$proxy$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/src/app/page.tsx (client reference/proxy) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$page$2e$tsx__$28$client__reference$2f$proxy$29$__ = __turbopack_context__.i("[project]/src/app/page.tsx (client reference/proxy)");
;
__turbopack_context__.n(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$page$2e$tsx__$28$client__reference$2f$proxy$29$__);
}}),
"[project]/src/app/page.tsx [app-rsc] (ecmascript, Next.js server component)": ((__turbopack_context__) => {

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.n(__turbopack_context__.i("[project]/src/app/page.tsx [app-rsc] (ecmascript)"));
}}),

};

//# sourceMappingURL=_b804845e._.js.map