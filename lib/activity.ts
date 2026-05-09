export function getUserId(): string {
  if (typeof window === "undefined") return "anonymous";
  let id = localStorage.getItem("nzrh_user_id");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("nzrh_user_id", id);
  }
  return id;
}

export function logActivity(data: {
  action_type: string;
  recipe_id?: string;
  store?: string;
  owned_ingredients?: string[];
  cheapest_store?: string;
  total_price?: number;
}) {
  fetch("/api/activity", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id: getUserId(), ...data }),
  }).catch(() => {});
}
