const DEFAULT_DISCOVERY_LIMITS = Object.freeze({
    maxSitemaps: 20,
    maxSitemapUrls: 5_000,
    maxSitemapDecompressedBytes: 8_000_000,
    maxSitemapDepth: 3,
    maxQueuedUrls: 1_000,
    maxPathDepth: 16,
    maxQueryVariantsPerPath: 5,
    maxPaginationValue: 250,
    maxCalendarYearDrift: 5
});

// Guard against faceted search matrix explosions & infinite calendar drift
function resolveDiscoveryLimits(pageLimit, overrides = {}) {
    return {
        maxPathDepth: boundedInteger(overrides.maxPathDepth, DEFAULT_DISCOVERY_LIMITS.maxPathDepth, { max: 100 }),
        maxQueryVariantsPerPath: boundedInteger(overrides.maxQueryVariantsPerPath, DEFAULT_DISCOVERY_LIMITS.maxQueryVariantsPerPath, { max: 100 }),
        maxPaginationValue: boundedInteger(overrides.maxPaginationValue, DEFAULT_DISCOVERY_LIMITS.maxPaginationValue, { max: 100_000 }),
        maxCalendarYearDrift: boundedInteger(overrides.maxCalendarYearDrift, DEFAULT_DISCOVERY_LIMITS.maxCalendarYearDrift, { min: 0, max: 50 })
    };
}