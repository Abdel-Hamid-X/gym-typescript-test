import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Logo from "@/assets/Logo.png";
import { useAuth } from "@/auth/AuthContext";
import { Coach, Equipment, SubscriptionPlan } from "@/shared/mockData";

const AdminDashboard = () => {
  const {
    user,
    users,
    subscriptionPlans,
    coaches,
    equipment,
    logout,
    updateUserSubscription,
    deleteUser,
    addSubscriptionPlan,
    editSubscriptionPlan,
    deleteSubscriptionPlan,
    addCoach,
    editCoach,
    deleteCoach,
    addEquipment,
    editEquipment,
    deleteEquipment,
  } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<"members" | "subscriptions" | "coaches" | "equipment">("members");

  // Subscription Plan Forms State
  const [planName, setPlanName] = useState("");
  const [planPrice, setPlanPrice] = useState(1000);
  const [planDescription, setPlanDescription] = useState("");
  const [planFeatures, setPlanFeatures] = useState("");
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);

  // Coach Forms State
  const [coachName, setCoachName] = useState("");
  const [coachSpec, setCoachSpec] = useState("");
  const [coachBio, setCoachBio] = useState("");
  const [editingCoach, setEditingCoach] = useState<Coach | null>(null);

  // Equipment Forms State
  const [eqName, setEqName] = useState("");
  const [eqType, setEqType] = useState<Equipment["type"]>("Strength");
  const [eqQty, setEqQty] = useState(1);
  const [eqStatus, setEqStatus] = useState<Equipment["status"]>("Operational");
  const [editingEq, setEditingEq] = useState<Equipment | null>(null);

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  // Members logic
  const handleTierChange = (email: string, newTier: any) => {
    const target = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!target) return;

    let expiresAt = target.subscriptionExpiresAt;
    if (newTier === "None") {
      expiresAt = null;
    } else if (!expiresAt || new Date(expiresAt).getTime() <= Date.now()) {
      const d = new Date();
      d.setDate(d.getDate() + 30);
      expiresAt = d.toISOString();
    }
    updateUserSubscription(email, newTier, expiresAt);
  };

  const adjustDays = (email: string, days: number) => {
    const target = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!target) return;

    let base = Date.now();
    if (target.subscriptionExpiresAt) {
      const current = new Date(target.subscriptionExpiresAt).getTime();
      if (current > base) {
        base = current;
      }
    }

    const newExpiry = new Date(base + days * 24 * 60 * 60 * 1000);
    updateUserSubscription(
      email,
      target.membershipStatus === "None"
        ? subscriptionPlans[0]?.name ?? "Plan 1"
        : target.membershipStatus,
      newExpiry.toISOString()
    );
  };

  // Subscription plan logic
  const parseFeatures = (features: string) =>
    features
      .split("\n")
      .map((feature) => feature.trim())
      .filter(Boolean);

  const handleAddPlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!planName || !planDescription) return;

    addSubscriptionPlan(planName, planPrice, planDescription, parseFeatures(planFeatures));
    setPlanName("");
    setPlanPrice(1000);
    setPlanDescription("");
    setPlanFeatures("");
  };

  const handleSavePlanEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlan) return;

    editSubscriptionPlan(
      editingPlan.id,
      editingPlan.name,
      editingPlan.price,
      editingPlan.description,
      editingPlan.features
    );
    setEditingPlan(null);
  };

  // Coaches logic
  const handleAddCoach = (e: React.FormEvent) => {
    e.preventDefault();
    if (!coachName || !coachSpec) return;
    addCoach(coachName, coachSpec, coachBio);
    setCoachName("");
    setCoachSpec("");
    setCoachBio("");
  };

  const handleSaveCoachEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCoach) return;
    editCoach(editingCoach.id, editingCoach.name, editingCoach.specialization, editingCoach.bio);
    setEditingCoach(null);
  };

  // Equipment logic
  const handleAddEquipment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eqName) return;
    addEquipment(eqName, eqType, eqQty, eqStatus);
    setEqName("");
    setEqType("Strength");
    setEqQty(1);
    setEqStatus("Operational");
  };

  const handleSaveEqEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEq) return;
    editEquipment(editingEq.id, editingEq.name, editingEq.type, editingEq.quantity, editingEq.status);
    setEditingEq(null);
  };

  return (
    <main className="min-h-screen bg-gray-20 px-6 py-10 text-white animate-fade-in">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
        <header className="flex items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <Link to="/" className="w-fit">
              <img alt="Evogym logo" src={Logo} />
            </Link>
            <span className="rounded-full bg-primary-100 border border-primary-500 px-3 py-1 text-xs font-bold text-primary-300">
              Admin Portal
            </span>
          </div>

          <button
            className="rounded-md bg-secondary-500 px-8 py-2 font-bold text-white transition duration-300 hover:bg-primary-500"
            onClick={handleLogout}
            type="button"
          >
            Logout
          </button>
        </header>

        {/* TAB CONTROLS */}
        <div className="flex border-b border-gray-100 bg-gray-50 rounded-t-md px-4 pt-2">
          <button
            className={`px-6 py-3 font-bold text-sm border-b-2 transition-colors ${
              activeTab === "members"
                ? "border-secondary-500 text-secondary-500"
                : "border-transparent text-gray-400 hover:text-white"
            }`}
            onClick={() => setActiveTab("members")}
          >
            Manage Members
          </button>
          <button
            className={`px-6 py-3 font-bold text-sm border-b-2 transition-colors ${
              activeTab === "coaches"
                ? "border-secondary-500 text-secondary-500"
                : "border-transparent text-gray-400 hover:text-white"
            }`}
            onClick={() => setActiveTab("coaches")}
          >
            Manage Coaches
          </button>
          <button
            className={`px-6 py-3 font-bold text-sm border-b-2 transition-colors ${
              activeTab === "subscriptions"
                ? "border-secondary-500 text-secondary-500"
                : "border-transparent text-gray-400 hover:text-white"
            }`}
            onClick={() => setActiveTab("subscriptions")}
          >
            Manage Subscriptions
          </button>
          <button
            className={`px-6 py-3 font-bold text-sm border-b-2 transition-colors ${
              activeTab === "equipment"
                ? "border-secondary-500 text-secondary-500"
                : "border-transparent text-gray-400 hover:text-white"
            }`}
            onClick={() => setActiveTab("equipment")}
          >
            Manage Equipment
          </button>
        </div>

        {/* TAB BODY */}
        <section className="rounded-b-md border-2 border-t-0 border-gray-100 bg-gray-50 px-8 py-10">
          {/* MEMBERS TAB */}
          {activeTab === "members" && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-6 animate-slide-down">Registered Gym Members</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-100 text-sm font-bold text-gray-300 bg-primary-100">
                      <th className="py-3 px-4">Name</th>
                      <th className="py-3 px-4">Email</th>
                      <th className="py-3 px-4">Tier</th>
                      <th className="py-3 px-4">Subscription Expires</th>
                      <th className="py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users
                      .filter((u) => u.role === "member")
                      .map((m) => {
                        const isExpired =
                          m.subscriptionExpiresAt &&
                          new Date(m.subscriptionExpiresAt).getTime() < Date.now();
                        return (
                          <tr key={m.email} className="border-b border-gray-100 hover:bg-primary-100/30 text-sm text-gray-300">
                            <td className="py-3 px-4 font-semibold text-white">{m.name}</td>
                            <td className="py-3 px-4">{m.email}</td>
                            <td className="py-3 px-4">
                              <select
                                value={m.membershipStatus}
                                onChange={(e) => handleTierChange(m.email, e.target.value)}
                                className="rounded border border-gray-100 bg-gray-50 text-white px-2 py-1 font-semibold text-xs outline-none"
                              >
                                <option value="None" className="bg-gray-50">None</option>
                                {subscriptionPlans.map((plan) => (
                                  <option value={plan.name} className="bg-gray-50" key={plan.id}>
                                    {plan.name}
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td className="py-3 px-4">
                              {m.subscriptionExpiresAt ? (
                                <span className={isExpired ? "text-primary-500 font-bold" : "text-gray-300"}>
                                  {new Date(m.subscriptionExpiresAt).toLocaleDateString()}
                                  {isExpired ? " (Expired)" : ""}
                                </span>
                              ) : (
                                "No active plan"
                              )}
                            </td>
                            <td className="py-3 px-4 flex flex-wrap gap-2">
                              <button
                                onClick={() => adjustDays(m.email, 7)}
                                className="rounded bg-primary-100 hover:bg-primary-300 border border-primary-500/20 text-primary-300 px-2 py-1 text-xs font-bold"
                              >
                                +7 Days
                              </button>
                              <button
                                onClick={() => adjustDays(m.email, -7)}
                                className="rounded bg-gray-100/10 hover:bg-gray-100/20 border border-gray-500/20 text-gray-300 px-2 py-1 text-xs font-bold"
                              >
                                -7 Days
                              </button>
                              <button
                                onClick={() => deleteUser(m.email)}
                                className="rounded bg-red-950/60 hover:bg-red-900 border border-red-500/30 text-red-400 px-2 py-1 text-xs font-bold"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SUBSCRIPTIONS TAB */}
          {activeTab === "subscriptions" && (
            <div className="flex flex-col gap-10">
              <div className="rounded-md border border-gray-100 p-6 bg-primary-100">
                <h3 className="text-lg font-bold text-white mb-4">
                  {editingPlan ? `Edit Plan: ${editingPlan.name}` : "Add Subscription Plan"}
                </h3>
                <form
                  onSubmit={editingPlan ? handleSavePlanEdit : handleAddPlan}
                  className="grid gap-4 md:grid-cols-3"
                >
                  <label className="flex flex-col gap-1 text-xs font-bold text-gray-300">
                    Plan Name
                    <input
                      type="text"
                      value={editingPlan ? editingPlan.name : planName}
                      onChange={(e) =>
                        editingPlan
                          ? setEditingPlan({ ...editingPlan, name: e.target.value })
                          : setPlanName(e.target.value)
                      }
                      className="rounded border border-gray-100 bg-gray-50 text-white px-3 py-2 font-normal text-sm outline-none focus:border-primary-300"
                      placeholder="Plan 1"
                      required
                    />
                  </label>
                  <label className="flex flex-col gap-1 text-xs font-bold text-gray-300">
                    Monthly Price
                    <input
                      type="number"
                      min={0}
                      value={editingPlan ? editingPlan.price : planPrice}
                      onChange={(e) =>
                        editingPlan
                          ? setEditingPlan({ ...editingPlan, price: parseInt(e.target.value) || 0 })
                          : setPlanPrice(parseInt(e.target.value) || 0)
                      }
                      className="rounded border border-gray-100 bg-gray-50 text-white px-3 py-2 font-normal text-sm outline-none focus:border-primary-300"
                      required
                    />
                  </label>
                  <label className="flex flex-col gap-1 text-xs font-bold text-gray-300 md:col-span-3">
                    Description
                    <textarea
                      rows={3}
                      value={editingPlan ? editingPlan.description : planDescription}
                      onChange={(e) =>
                        editingPlan
                          ? setEditingPlan({ ...editingPlan, description: e.target.value })
                          : setPlanDescription(e.target.value)
                      }
                      className="rounded border border-gray-100 bg-gray-50 text-white px-3 py-2 font-normal text-sm outline-none focus:border-primary-300"
                      required
                    />
                  </label>
                  <label className="flex flex-col gap-1 text-xs font-bold text-gray-300 md:col-span-3">
                    Features
                    <textarea
                      rows={4}
                      value={
                        editingPlan ? editingPlan.features.join("\n") : planFeatures
                      }
                      onChange={(e) =>
                        editingPlan
                          ? setEditingPlan({
                              ...editingPlan,
                              features: parseFeatures(e.target.value),
                            })
                          : setPlanFeatures(e.target.value)
                      }
                      className="rounded border border-gray-100 bg-gray-50 text-white px-3 py-2 font-normal text-sm outline-none focus:border-primary-300"
                      placeholder={"One feature per line"}
                    />
                  </label>

                  <div className="flex gap-3 md:col-span-3">
                    <button
                      type="submit"
                      className="rounded bg-secondary-500 hover:bg-primary-500 text-white font-bold px-6 py-2 text-sm"
                    >
                      {editingPlan ? "Save Changes" : "Create Plan"}
                    </button>
                    {editingPlan && (
                      <button
                        type="button"
                        onClick={() => setEditingPlan(null)}
                        className="rounded bg-gray-100/10 hover:bg-gray-100/20 text-gray-300 font-bold px-6 py-2 text-sm"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                {subscriptionPlans.map((plan) => (
                  <article
                    className="rounded-md border border-gray-100 bg-primary-100 p-5"
                    key={plan.id}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h4 className="font-montserrat text-3xl uppercase text-primary-300">
                          {plan.name}
                        </h4>
                        <p className="mt-2 text-2xl font-bold text-white">
                          {plan.price.toLocaleString("fr-DZ")} DA/mois
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditingPlan(plan)}
                          className="rounded bg-gray-100/10 hover:bg-gray-100/20 border border-gray-500/20 text-gray-300 px-2 py-1 text-xs font-bold"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteSubscriptionPlan(plan.id)}
                          className="rounded bg-red-950/60 hover:bg-red-900 border border-red-500/20 text-red-400 px-2 py-1 text-xs font-bold"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    <p className="mt-4 text-sm text-gray-400">{plan.description}</p>
                    <ul className="mt-4 flex flex-col gap-2 text-sm text-gray-300">
                      {plan.features.map((feature) => (
                        <li className="border-b border-gray-100 pb-2" key={feature}>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </article>
                ))}
              </div>
            </div>
          )}

          {/* COACHES TAB */}
          {activeTab === "coaches" && (
            <div className="flex flex-col gap-10">
              {/* ADD/EDIT COACH FORM */}
              <div className="rounded-md border border-gray-100 p-6 bg-primary-100">
                <h3 className="text-lg font-bold text-white mb-4">
                  {editingCoach ? `Edit Coach: ${editingCoach.name}` : "Add New Coach"}
                </h3>
                <form
                  onSubmit={editingCoach ? handleSaveCoachEdit : handleAddCoach}
                  className="grid gap-4 md:grid-cols-3"
                >
                  <label className="flex flex-col gap-1 text-xs font-bold text-gray-300">
                    Full Name
                    <input
                      type="text"
                      value={editingCoach ? editingCoach.name : coachName}
                      onChange={(e) =>
                        editingCoach
                          ? setEditingCoach({ ...editingCoach, name: e.target.value })
                          : setCoachName(e.target.value)
                      }
                      className="rounded border border-gray-100 bg-gray-50 text-white px-3 py-2 font-normal text-sm outline-none focus:border-primary-300"
                      placeholder="e.g. Marcus Vance"
                      required
                    />
                  </label>
                  <label className="flex flex-col gap-1 text-xs font-bold text-gray-300">
                    Specialization
                    <input
                      type="text"
                      value={editingCoach ? editingCoach.specialization : coachSpec}
                      onChange={(e) =>
                        editingCoach
                          ? setEditingCoach({ ...editingCoach, specialization: e.target.value })
                          : setCoachSpec(e.target.value)
                      }
                      className="rounded border border-gray-100 bg-gray-50 text-white px-3 py-2 font-normal text-sm outline-none focus:border-primary-300"
                      placeholder="e.g. HIIT & Endurance"
                      required
                    />
                  </label>
                  <label className="flex flex-col gap-1 text-xs font-bold text-gray-300 md:col-span-3">
                    Biography
                    <textarea
                      rows={3}
                      value={editingCoach ? editingCoach.bio : coachBio}
                      onChange={(e) =>
                        editingCoach
                          ? setEditingCoach({ ...editingCoach, bio: e.target.value })
                          : setCoachBio(e.target.value)
                      }
                      className="rounded border border-gray-100 bg-gray-50 text-white px-3 py-2 font-normal text-sm outline-none focus:border-primary-300"
                      placeholder="Write a brief background..."
                    />
                  </label>

                  <div className="flex gap-3 md:col-span-3">
                    <button
                      type="submit"
                      className="rounded bg-secondary-500 hover:bg-primary-500 text-white font-bold px-6 py-2 text-sm"
                    >
                      {editingCoach ? "Save Changes" : "Create Coach"}
                    </button>
                    {editingCoach && (
                      <button
                        type="button"
                        onClick={() => setEditingCoach(null)}
                        className="rounded bg-gray-100/10 hover:bg-gray-150 text-gray-300 font-bold px-6 py-2 text-sm"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              </div>

              {/* COACHES LIST */}
              <div>
                <h3 className="text-xl font-bold text-white mb-4">Current Coaches</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  {coaches.map((c) => (
                    <div key={c.id} className="rounded border border-gray-100 bg-primary-100 p-5 flex justify-between gap-4">
                      <div>
                        <h4 className="font-bold text-primary-300 text-lg">{c.name}</h4>
                        <span className="inline-block rounded bg-primary-100 border border-primary-500/10 px-2 py-0.5 text-xs font-semibold text-primary-300 mt-1">
                          {c.specialization}
                        </span>
                        <p className="text-sm text-gray-400 mt-3">{c.bio}</p>
                      </div>
                      <div className="flex flex-col gap-2 shrink-0">
                        <button
                          onClick={() => setEditingCoach(c)}
                          className="rounded bg-gray-100/10 hover:bg-gray-100/20 border border-gray-500/20 text-gray-300 font-bold px-3 py-1 text-xs"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteCoach(c.id)}
                          className="rounded bg-red-950/60 hover:bg-red-900 border border-red-500/20 text-red-400 font-bold px-3 py-1 text-xs"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* EQUIPMENT TAB */}
          {activeTab === "equipment" && (
            <div className="flex flex-col gap-10">
              {/* ADD/EDIT EQUIPMENT FORM */}
              <div className="rounded-md border border-gray-100 p-6 bg-primary-100">
                <h3 className="text-lg font-bold text-white mb-4">
                  {editingEq ? `Edit Equipment: ${editingEq.name}` : "Add Gym Equipment"}
                </h3>
                <form
                  onSubmit={editingEq ? handleSaveEqEdit : handleAddEquipment}
                  className="grid gap-4 md:grid-cols-4"
                >
                  <label className="flex flex-col gap-1 text-xs font-bold text-gray-300">
                    Equipment Name
                    <input
                      type="text"
                      value={editingEq ? editingEq.name : eqName}
                      onChange={(e) =>
                        editingEq
                          ? setEditingEq({ ...editingEq, name: e.target.value })
                          : setEqName(e.target.value)
                      }
                      className="rounded border border-gray-100 bg-gray-50 text-white px-3 py-2 font-normal text-sm outline-none focus:border-primary-300"
                      placeholder="e.g. Rowers"
                      required
                    />
                  </label>
                  <label className="flex flex-col gap-1 text-xs font-bold text-gray-300">
                    Type
                    <select
                      value={editingEq ? editingEq.type : eqType}
                      onChange={(e) =>
                        editingEq
                          ? setEditingEq({ ...editingEq, type: e.target.value as any })
                          : setEqType(e.target.value as any)
                      }
                      className="rounded border border-gray-100 bg-gray-50 text-white px-3 py-2 font-normal text-sm outline-none focus:border-primary-300"
                    >
                      <option value="Strength" className="bg-gray-50">Strength</option>
                      <option value="Cardio" className="bg-gray-50">Cardio</option>
                      <option value="Accessories" className="bg-gray-50">Accessories</option>
                      <option value="Other" className="bg-gray-50">Other</option>
                    </select>
                  </label>
                  <label className="flex flex-col gap-1 text-xs font-bold text-gray-300">
                    Quantity
                    <input
                      type="number"
                      min={1}
                      value={editingEq ? editingEq.quantity : eqQty}
                      onChange={(e) =>
                        editingEq
                          ? setEditingEq({ ...editingEq, quantity: parseInt(e.target.value) || 1 })
                          : setEqQty(parseInt(e.target.value) || 1)
                      }
                      className="rounded border border-gray-100 bg-gray-50 text-white px-3 py-2 font-normal text-sm outline-none focus:border-primary-300"
                      required
                    />
                  </label>
                  <label className="flex flex-col gap-1 text-xs font-bold text-gray-300">
                    Status
                    <select
                      value={editingEq ? editingEq.status : eqStatus}
                      onChange={(e) =>
                        editingEq
                          ? setEditingEq({ ...editingEq, status: e.target.value as any })
                          : setEqStatus(e.target.value as any)
                      }
                      className="rounded border border-gray-100 bg-gray-50 text-white px-3 py-2 font-normal text-sm outline-none focus:border-primary-300"
                    >
                      <option value="Operational" className="bg-gray-50">Operational</option>
                      <option value="Under Maintenance" className="bg-gray-50">Under Maintenance</option>
                    </select>
                  </label>

                  <div className="flex gap-3 md:col-span-4 mt-2">
                    <button
                      type="submit"
                      className="rounded bg-secondary-500 hover:bg-primary-500 text-white font-bold px-6 py-2 text-sm"
                    >
                      {editingEq ? "Save Changes" : "Create Item"}
                    </button>
                    {editingEq && (
                      <button
                        type="button"
                        onClick={() => setEditingEq(null)}
                        className="rounded bg-gray-100/10 hover:bg-gray-150 text-gray-300 font-bold px-6 py-2 text-sm"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              </div>

              {/* EQUIPMENT TABLE */}
              <div>
                <h3 className="text-xl font-bold text-white mb-4">Equipment List</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-gray-100 text-sm font-bold text-gray-300 bg-primary-100">
                        <th className="py-3 px-4">Name</th>
                        <th className="py-3 px-4">Category</th>
                        <th className="py-3 px-4">Quantity</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {equipment.map((item) => (
                        <tr key={item.id} className="border-b border-gray-100 hover:bg-primary-100/50 text-sm text-gray-300">
                          <td className="py-3 px-4 font-semibold text-white">{item.name}</td>
                          <td className="py-3 px-4">{item.type}</td>
                          <td className="py-3 px-4">{item.quantity}</td>
                          <td className="py-3 px-4">
                            <span
                              className={`inline-block px-3 py-1 text-xs font-bold rounded-full ${
                                item.status === "Operational"
                                  ? "bg-green-955/60 text-green-400 border border-green-900/50"
                                  : "bg-orange-955/60 text-orange-400 border border-orange-900/50"
                              }`}
                            >
                              {item.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 flex gap-2">
                            <button
                              onClick={() => setEditingEq(item)}
                              className="rounded bg-gray-100/10 hover:bg-gray-100/20 border border-gray-500/20 text-gray-300 px-2 py-1 text-xs font-bold"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => deleteEquipment(item.id)}
                              className="rounded bg-red-950/60 hover:bg-red-900 border border-red-500/20 text-red-400 px-2 py-1 text-xs font-bold"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

        </section>
      </div>
    </main>
  );
};

export default AdminDashboard;
