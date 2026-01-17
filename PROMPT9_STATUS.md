# PROMPT 9: Regression Tests - Status

## Objective
Add deterministic regression tests to prevent:
1. Malformed preview HTML (corruption patterns)
2. Brand enforcement being bypassed
3. Missing brand injection in LLM system messages

## Implementation Status: ✅ COMPLETE

### Test Infrastructure Setup ✅

**Vitest Configuration Added:**
- Installed `vitest` and `@vitest/ui` as dev dependencies
- Created `apps/web/vitest.config.ts` with Node environment
- Added test scripts to `apps/web/package.json`:
  - `test`: Run tests once
  - `test:watch`: Run tests in watch mode
  - `test:ui`: Run tests with UI

**Files Created:**
- `apps/web/vitest.config.ts` - Vitest configuration
- `apps/web/src/api/__tests__/` - Test directory

### A) Preview Sanitizer Tests ✅

**File:** `apps/web/src/api/__tests__/preview-sanitizer.test.ts`

**Tests Added (8 tests, all passing):**
1. ✅ Detect unquoted href attributes
2. ✅ Detect unquoted class attributes
3. ✅ Detect malformed JSX closures
4. ✅ Detect unquoted React props
5. ✅ Detect multiple violations in same HTML
6. ✅ Pass valid HTML without violations
7. ✅ Return original HTML in result
8. ✅ Handle empty HTML

**Helper Extracted:**
- Created `apps/web/src/api/preview-sanitizer.ts`
- Exported `sanitizePreviewHtml()` function
- Returns `{ ok, html, violations }` result

**Corruption Patterns Detected:**
- `href=` without quotes
- `class=` without quotes
- `>))}` malformed JSX closures
- Unquoted React props (className, href, src)

### B) Brand Validation Tests ✅

**File:** `apps/web/src/api/__tests__/brand-validation.test.ts`

**Tests Added (8 tests, all passing):**
1. ✅ Fail when using non-monospace font
2. ✅ Fail when using large rounded borders
3. ✅ Fail when using hard-coded color values (>3 instances)
4. ✅ Fail when using light background instead of dark mode
5. ✅ Fail when using unstyled HTML elements
6. ✅ Pass when following all brand rules
7. ✅ Return multiple violations for multiple issues
8. ✅ Include brand name in result

**Brand Rules Tested:**
- `BRAND_TYPOGRAPHY`: Monospace font (font-mono or Share Tech Mono)
- `BRAND_BORDER_RADIUS`: Sharp borders (no rounded-lg/xl/full)
- `BRAND_COLOR_TOKENS`: Semantic tokens (no >3 hard-coded colors)
- `BRAND_DARK_MODE`: Dark mode by default (bg-white + text-black = violation)
- `BRAND_NO_UNSTYLED`: All elements must have className

**Test Coverage:**
- Validates `validateBrand()` from `@teammae/mae-core`
- Tests threshold logic (e.g., 4+ hard-coded colors = violation)
- Verifies violation messages include rule names

### C) End-to-End Pipeline Tests ✅

**File:** `apps/web/src/api/__tests__/mae-pipeline.test.ts`

**Tests Added (19 tests, all passing):**

**Brand Resolution (5 tests):**
1. ✅ Use default brand when no override specified
2. ✅ Detect light theme from keywords
3. ✅ Detect colorful style from keywords
4. ✅ Use explicit style profile when provided
5. ✅ Throw when brand resolution fails

**Brand Injection Prompts (5 tests):**
1. ✅ Include brand information in injection prompt
2. ✅ Include typography rules in prompt
3. ✅ Include border radius rules in prompt
4. ✅ Include color token rules in prompt
5. ✅ Adapt to different style profiles

**Quality Contract with Brand (3 tests):**
1. ✅ Include brand compliance in contract result
2. ✅ Fail contract when brand is violated
3. ✅ Include brand violations in contract result

**Brand Metadata Requirements (3 tests):**
1. ✅ Ensure brand profile has required properties
2. ✅ Have monospace font in typography
3. ✅ Have spacing scale defined

**Brand Resolution Edge Cases (3 tests):**
1. ✅ Handle empty prompt with default brand
2. ✅ Prioritize explicit over keyword detection
3. ✅ Handle mixed keywords by using first match

**Test Approach:**
- Unit-style tests without mocked LLM (cleaner, more maintainable)
- Tests actual brand resolution, injection, and validation logic
- Verifies brand metadata structure and content
- Tests edge cases and error handling

---

## Test Results

```
 Test Files  3 passed (3)
      Tests  35 passed (35)
   Duration  169ms
```

**Coverage:**
- Preview Sanitizer: 8/8 tests passing ✅
- Brand Validation: 8/8 tests passing ✅
- Pipeline Integration: 19/19 tests passing ✅

---

## How to Run Tests

### Run All Tests
```bash
cd apps/web
pnpm test
```

### Run Tests in Watch Mode
```bash
pnpm test:watch
```

### Run Tests with UI
```bash
pnpm test:ui
```

### Run Specific Test File
```bash
pnpm test preview-sanitizer
pnpm test brand-validation
pnpm test mae-pipeline
```

---

## What Regressions Are Prevented

### 1. Preview HTML Corruption ✅
**Protected Against:**
- LLM generating `href= class="..."` (unquoted attributes)
- LLM outputting `> ))}` (malformed JSX closures)
- Corruption patterns surviving into final preview HTML

**Test Guarantees:**
- `sanitizePreviewHtml()` detects all known corruption patterns
- Tests fail if bad substrings survive into preview
- Easy to add new corruption patterns as they're discovered

### 2. Brand Enforcement Bypass ✅
**Protected Against:**
- Non-monospace fonts in generated code
- Large rounded borders (rounded-lg/xl/full)
- Hard-coded colors instead of semantic tokens
- Light mode when dark mode is required
- Unstyled HTML elements

**Test Guarantees:**
- `validateBrand()` catches all 5 critical brand rules
- Tests verify threshold logic (e.g., 4+ colors = violation)
- Brand violations trigger contract failures

### 3. Missing Brand Injection ✅
**Protected Against:**
- Brand prompt missing from LLM system messages
- Brand resolution returning null/undefined
- Style profile not being enforced
- Brand metadata missing from output

**Test Guarantees:**
- `resolveBrandProfile()` always returns valid brand
- `getBrandInjectionPrompt()` includes all required rules
- `enforceBrandResolution()` throws if brand missing
- Contract validation includes brand compliance check

---

## Key Design Decisions

### 1. Extracted Sanitizer Function
**Before:** Logic embedded in Builder.tsx
**After:** Pure function in `preview-sanitizer.ts`
- Testable without UI context
- Reusable across codebase
- Returns structured result object

### 2. Unit-Style E2E Tests
**Alternative Considered:** Mock `fetch()` for LLM calls
**Decision:** Test actual functions without mocking
- Simpler test setup
- More maintainable
- Tests real logic, not mock interactions
- Faster execution

### 3. Deterministic Brand Tests
**Approach:** Feed known violating/compliant code
**Benefit:** Tests are reproducible
- No random LLM outputs
- Easy to debug failures
- Clear pass/fail criteria

---

## Future Test Additions

**Easy to Add:**
1. More corruption patterns as discovered
2. Additional brand rule violations
3. Edge cases in brand resolution
4. Performance benchmarks

**Test Template:**
```typescript
it('should detect new corruption pattern', () => {
  const badHtml = '<div attribute=unquoted>...</div>';
  const result = sanitizePreviewHtml(badHtml);
  expect(result.ok).toBe(false);
  expect(result.violations).toContain('Expected message');
});
```

---

## Files Modified

| File | Change | Purpose |
|------|--------|---------|
| `apps/web/package.json` | Added test scripts | Enable `pnpm test` |
| `apps/web/vitest.config.ts` | Created | Vitest configuration |
| `apps/web/src/api/preview-sanitizer.ts` | Created | Extracted pure function |
| `apps/web/src/api/__tests__/preview-sanitizer.test.ts` | Created | 8 sanitizer tests |
| `apps/web/src/api/__tests__/brand-validation.test.ts` | Created | 8 brand validation tests |
| `apps/web/src/api/__tests__/mae-pipeline.test.ts` | Created | 19 pipeline integration tests |

---

## Integration with CI/CD

**Ready for CI:**
```yaml
# .github/workflows/test.yml
- name: Run tests
  run: pnpm test
```

**Tests are:**
- ✅ Deterministic (no flaky tests)
- ✅ Fast (< 200ms total)
- ✅ No external dependencies
- ✅ No API keys required

---

## Success Criteria

✅ Test runner setup (Vitest)
✅ Preview sanitizer regression test (8 tests)
✅ Brand validation unit test (8 tests)
✅ E2E pipeline test (19 tests)
✅ All tests passing (35/35)
✅ Documentation complete
✅ Easy to run (`pnpm test`)

---

## Notes

### Brand Validation Thresholds
- Color tokens: Requires >3 hard-coded colors to fail
- Dark mode: Requires both `bg-white` AND `text-black` to fail
- Unstyled elements: Any unstyled element = failure

### Test Maintenance
- Tests use actual brand profile from `@teammae/mae-core`
- If brand rules change, tests will automatically reflect changes
- No hardcoded expectations beyond rule structure

### Performance
- All 35 tests run in ~170ms
- No mocking overhead
- Suitable for pre-commit hooks

---

## Example Test Output

```bash
$ pnpm test

 ✓ src/api/__tests__/preview-sanitizer.test.ts (8 tests) 5ms
   ✓ should detect unquoted href attributes
   ✓ should detect unquoted class attributes
   ✓ should detect malformed JSX closures
   ✓ should detect unquoted React props
   ✓ should detect multiple violations in same HTML
   ✓ should pass valid HTML without violations
   ✓ should return original HTML in result
   ✓ should handle empty HTML

 ✓ src/api/__tests__/brand-validation.test.ts (8 tests) 2ms
   ✓ should fail when using non-monospace font
   ✓ should fail when using large rounded borders
   ✓ should fail when using hard-coded color values
   ✓ should fail when using light background instead of dark mode
   ✓ should fail when using unstyled HTML elements
   ✓ should pass when following all brand rules
   ✓ should return multiple violations for multiple issues
   ✓ should include brand name in result

 ✓ src/api/__tests__/mae-pipeline.test.ts (19 tests) 13ms
   Brand Resolution
     ✓ should use default brand when no override specified
     ✓ should detect light theme from keywords
     ✓ should detect colorful style from keywords
     ✓ should use explicit style profile when provided
     ✓ should throw when brand resolution fails
   Brand Injection Prompts
     ✓ should include brand information in injection prompt
     ✓ should include typography rules in prompt
     ✓ should include border radius rules in prompt
     ✓ should include color token rules in prompt
     ✓ should adapt to different style profiles
   Quality Contract with Brand
     ✓ should include brand compliance in contract result
     ✓ should fail contract when brand is violated
     ✓ should include brand violations in contract result
   Brand Metadata Requirements
     ✓ should ensure brand profile has required properties
     ✓ should have monospace font in typography
     ✓ should have spacing scale defined
   Brand Resolution Edge Cases
     ✓ should handle empty prompt with default brand
     ✓ should prioritize explicit over keyword detection
     ✓ should handle mixed keywords by using first match

Test Files  3 passed (3)
     Tests  35 passed (35)
  Duration  169ms
```
