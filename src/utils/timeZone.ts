export function isSupportedTimeZone(timeZone: string) {
  return Intl.supportedValuesOf("timeZone").includes(timeZone);
}
