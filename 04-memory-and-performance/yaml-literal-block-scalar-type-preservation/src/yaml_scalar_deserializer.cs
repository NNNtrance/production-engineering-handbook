// aaubry/YamlDotNet PR #1130 by @onuracar-dev
// Preserves literal block scalars as strings during unquoted type deserialization

private object? AttemptUnknownTypeDeserialization(Scalar value)
{
    // BUG: Only SingleQuoted, DoubleQuoted, and Folded were protected.
    // Literal block scalars (ScalarStyle.Literal using '|' or '|-')
    // were omitted, causing content like "Value: |-\n  true\n"
    // to be incorrectly inferred as Boolean true instead of String "true"!
    
    // FIX: Restrict unknown-object type inference strictly to Plain scalars:
    if (value.Style != ScalarStyle.Plain)
    {
        return value.Value;
    }

    // Proceed with boolean, integer, double, date inference only for plain scalars...
    return AttemptTypeInference(value.Value);
}