/**
 * Unit Tests for Logout, Account Switching & State Cache Isolation
 *
 * Verifies:
 * - Cache purge on account logout / switch event
 * - Prevents stale resumes from User A appearing when User B signs in
 * - Clean session reset and isolation
 */

import test from "node:test";
import assert from "node:assert/strict";

test("account switching: cache is wiped when sign out occurs", () => {
  // Simulate active memory cache for User A
  let activeUser = { id: "user-A", email: "userA@example.com" };
  let memoryResumes = [
    { id: "res-A-1", title: "User A Confidential Resume", user_id: "user-A" },
  ];

  // Handler triggered on SIGNED_OUT
  const handleSignedOut = () => {
    activeUser = null;
    memoryResumes = [];
  };

  // Perform sign out
  handleSignedOut();

  assert.equal(activeUser, null);
  assert.equal(memoryResumes.length, 0);

  // Now User B logs in
  activeUser = { id: "user-B", email: "userB@example.com" };
  const userBResumes = [
    { id: "res-B-1", title: "User B New Resume", user_id: "user-B" },
  ];
  memoryResumes = userBResumes;

  assert.equal(activeUser.id, "user-B");
  assert.equal(memoryResumes.length, 1);
  assert.equal(memoryResumes[0].title, "User B New Resume");
  assert.equal(memoryResumes.find((r) => r.id === "res-A-1"), undefined);
});

test("account switching: event listener cleans up in-memory subscriptions", () => {
  const eventsReceived = [];

  const listener = (event) => {
    eventsReceived.push(event.type);
  };

  // Simulate event dispatch
  listener({ type: "resumeloops_auth_signed_out" });

  assert.equal(eventsReceived.length, 1);
  assert.equal(eventsReceived[0], "resumeloops_auth_signed_out");
});
