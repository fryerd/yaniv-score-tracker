import { test, expect } from '@playwright/test';

/**
 * E2E Tests for Yaniv Score Tracker
 *
 * These tests verify the full user flow works correctly in a real browser.
 * They simulate actual user interactions like clicking, typing, and navigating.
 */

test.describe('Home Page', () => {
  test('shows the home page with Start New Game button', async ({ page }) => {
    await page.goto('/');

    // Check the title is visible
    await expect(page.locator('text=YANIV')).toBeVisible();

    // Check Start New Game button exists
    await expect(page.locator('text=Start New Game')).toBeVisible();
  });

  test('navigates to game setup when clicking Start New Game', async ({ page }) => {
    await page.goto('/');

    await page.click('text=Start New Game');

    // Should be on the new game page
    await expect(page).toHaveURL('/game/new');
  });
});

test.describe('Game Setup Flow', () => {
  test('can select player count and continue', async ({ page }) => {
    await page.goto('/game/new');

    // Should see player count question
    await expect(page.locator('text=How many players')).toBeVisible();

    // Default is 4 players
    await expect(page.locator('text=4').first()).toBeVisible();

    // Click continue
    await page.click('text=Continue');

    // Should now see player name input
    await expect(page.locator('text=Who\'s playing')).toBeVisible();
  });

  test('can enter player names and continue', async ({ page }) => {
    await page.goto('/game/new');

    // Continue past player count
    await page.click('text=Continue');

    // Fill in player names (4 players by default)
    const inputs = page.locator('input[placeholder^="Player"]');
    await inputs.nth(0).fill('Alice');
    await inputs.nth(1).fill('Bob');
    await inputs.nth(2).fill('Charlie');
    await inputs.nth(3).fill('Diana');

    // Continue button should be enabled now
    await page.click('text=Continue');

    // Should be on house rules page
    await expect(page.locator('text=House Rules')).toBeVisible();
  });

  test('can configure house rules and start game', async ({ page }) => {
    await page.goto('/game/new');

    // Step 1: Player count - continue with default 4
    await page.click('text=Continue');

    // Step 2: Enter player names
    const inputs = page.locator('input[placeholder^="Player"]');
    await inputs.nth(0).fill('Alice');
    await inputs.nth(1).fill('Bob');
    await inputs.nth(2).fill('Charlie');
    await inputs.nth(3).fill('Diana');
    await page.click('text=Continue');

    // Step 3: House rules - use defaults
    await expect(page.locator('text=House Rules')).toBeVisible();
    await page.click('text=Confirm Rules');

    // Step 4: Final confirmation
    await expect(page.locator('text=Let\'s go!')).toBeVisible();
    await page.click('text=Let\'s Play');

    // Should be on game play page
    await expect(page).toHaveURL('/game/play');
  });
});

test.describe('Game Play', () => {
  // Helper to set up a game quickly
  async function setupGame(page: import('@playwright/test').Page, playerNames: string[] = ['Alice', 'Bob']) {
    await page.goto('/game/new');

    // Adjust player count if needed
    const targetCount = playerNames.length;
    // Default is 4, need to decrease
    for (let i = 4; i > targetCount; i--) {
      await page.click('button:has-text("−")');
    }
    await page.click('text=Continue');

    // Enter names
    const inputs = page.locator('input[placeholder^="Player"]');
    for (let i = 0; i < playerNames.length; i++) {
      await inputs.nth(i).fill(playerNames[i]);
    }
    await page.click('text=Continue');

    // Confirm rules (defaults)
    await page.click('text=Confirm Rules');

    // Start game
    await page.click('text=Let\'s Play');

    await expect(page).toHaveURL('/game/play');
  }

  test('displays game screen with players and round 1', async ({ page }) => {
    await setupGame(page, ['Alice', 'Bob']);

    // Should show both players via their initials in avatars
    // Alice -> "A", Bob -> "B"
    await expect(page.locator('text=A').first()).toBeVisible();
    await expect(page.locator('text=B').first()).toBeVisible();

    // Should show empty state message before any rounds
    await expect(page.locator('text=Tap below to add first round')).toBeVisible();

    // Should have Add Round button
    await expect(page.locator('text=Add Round 1 Scores')).toBeVisible();
  });

  test('can start entering scores for a round', async ({ page }) => {
    await setupGame(page, ['Alice', 'Bob']);

    // Click Add Round button
    await page.click('text=Add Round 1 Scores');

    // Should see "Who called Yaniv?" prompt
    await expect(page.locator('text=Who called Yaniv')).toBeVisible();

    // Should see both player options
    await expect(page.locator('text=Alice').first()).toBeVisible();
    await expect(page.locator('text=Bob').first()).toBeVisible();
  });

  test('can complete a full round and see scores update', async ({ page }) => {
    await setupGame(page, ['Alice', 'Bob']);

    // Start new round
    await page.click('text=Add Round 1 Scores');

    // Select Alice as Yaniv caller
    await page.click('text=Alice');

    // Wait for score input screen to be ready
    await expect(page.locator('text=hand total')).toBeVisible();

    // Enter Alice's score (3) - she called Yaniv so should be first
    // Use exact text match to avoid matching other buttons
    await page.locator('button', { hasText: /^3$/ }).click();
    await page.click('text=Next');

    // Wait for animation to complete and Bob's input to be ready
    await page.waitForTimeout(500);
    await expect(page.locator('text=hand total')).toBeVisible();

    // Enter Bob's score (8) - single digit to avoid selector ambiguity
    await page.locator('button', { hasText: /^8$/ }).click();
    await page.click('text=Done');

    // Wait for round to be processed and animations to complete
    await page.waitForTimeout(3500);

    // Round should be visible now (R1 appears after round is added)
    await expect(page.locator('text=R1')).toBeVisible();

    // Bob should have 8 points (Alice won with 3, Bob scored his hand total)
    await expect(page.locator('text=8').first()).toBeVisible();
  });
});

test.describe('Continue Game', () => {
  test('can continue a saved game from home page', async ({ page }) => {
    // First, create a game
    await page.goto('/game/new');

    // Quick setup for 2 players
    await page.click('button:has-text("−")');
    await page.click('button:has-text("−")');
    await page.click('text=Continue');

    const inputs = page.locator('input[placeholder^="Player"]');
    await inputs.nth(0).fill('Alice');
    await inputs.nth(1).fill('Bob');
    await page.click('text=Continue');
    await page.click('text=Confirm Rules');
    await page.click('text=Let\'s Play');

    // Now go back to home
    await page.goto('/');

    // Should see Continue Game option (game is saved in localStorage)
    await expect(page.locator('text=Continue Game')).toBeVisible();

    // Click it
    await page.click('text=Continue Game');

    // Should be back on game play page
    await expect(page).toHaveURL('/game/play');
  });
});

test.describe('Share Results', () => {
  // Helper to play rounds until game ends
  async function playUntilGameEnds(page: import('@playwright/test').Page) {
    await page.goto('/game/new');

    // Setup 2 players with low max score for quick game end
    await page.click('button:has-text("−")');
    await page.click('button:has-text("−")');
    await page.click('text=Continue');

    const inputs = page.locator('input[placeholder^="Player"]');
    await inputs.nth(0).fill('Alice');
    await inputs.nth(1).fill('Bob');
    await page.click('text=Continue');

    // Set max score to 50 for quick game end
    await page.locator('input[type="number"]').first().fill('50');
    await page.click('text=Confirm Rules');
    await page.click('text=Let\'s Play');

    // Play rounds until someone busts
    // Round 1: Alice calls Yaniv with 3, Bob has 25
    await page.click('text=Add Round 1 Scores');
    await page.click('text=Alice');
    await page.waitForTimeout(300);
    await page.locator('button', { hasText: /^3$/ }).click();
    await page.click('text=Next');
    await page.waitForTimeout(500);
    await page.locator('button', { hasText: /^2$/ }).click();
    await page.locator('button', { hasText: /^5$/ }).click();
    await page.click('text=Done');
    await page.waitForTimeout(3500);

    // Round 2: Bob calls Yaniv with 4, Alice has 30
    await page.click('text=Add Round 2 Scores');
    await page.click('text=Bob');
    await page.waitForTimeout(300);
    await page.locator('button', { hasText: /^4$/ }).click();
    await page.click('text=Next');
    await page.waitForTimeout(500);
    await page.locator('button', { hasText: /^3$/ }).click();
    await page.locator('button', { hasText: /^0$/ }).click();
    await page.click('text=Done');
    await page.waitForTimeout(3500);

    // Wait for game to end and show results
    await page.waitForTimeout(4000);
  }

  test('shows Share Results button after game ends', async ({ page }) => {
    await playUntilGameEnds(page);

    // Should eventually show the results screen with Share Results button
    await expect(page.locator('text=Share Results')).toBeVisible({ timeout: 10000 });
  });

  test('Share Results button is clickable', async ({ page }) => {
    await playUntilGameEnds(page);

    // Wait for Share Results button
    const shareButton = page.locator('button:has-text("Share Results")');
    await expect(shareButton).toBeVisible({ timeout: 10000 });

    // Click it (in E2E tests it will try clipboard, which may fail, but button should be clickable)
    await shareButton.click();

    // Button should show feedback (either "Copied to clipboard!" or "Could not copy")
    await expect(
      page.locator('button:has-text("Copied to clipboard!"), button:has-text("Could not copy")')
    ).toBeVisible({ timeout: 3000 });
  });
});
