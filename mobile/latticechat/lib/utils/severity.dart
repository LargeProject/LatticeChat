enum Severity {
  none,      // no problem, e.g. "Available"
  unknown,   // waiting, checking
  minor,     // small hint, e.g. empty field
  major,     // format error, invalid input
  critical,  // server unreachable, name taken
}