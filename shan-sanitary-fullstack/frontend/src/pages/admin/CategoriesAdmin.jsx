import { useState, useEffect } from "react";
import api from "../../services/api";

const emptyState = { name: "", parent: "", description: "" };

const CategoriesAdmin = () => {
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState(emptyState);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const load = () => {
    api.get("/categories/admin").then((res) => setCategories(res.data.data));
  };

  useEffect(load, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const startEdit = (cat) => {
    setEditingId(cat._id);
    setFormData({ name: cat.name, parent: cat.parent || "", description: cat.description || "" });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData(emptyState);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      if (editingId) {
        await api.patch(`/categories/${editingId}`, { ...formData, parent: formData.parent || null });
        setMessage("Category updated");
      } else {
        await api.post("/categories", { ...formData, parent: formData.parent || null });
        setMessage("Category created");
      }
      cancelEdit();
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Could not save category");
    } finally {
      setTimeout(() => setMessage(""), 2500);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Deactivate "${name}"?`)) return;
    try {
      await api.delete(`/categories/${id}`);
      setMessage(`"${name}" deactivated`);
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Could not deactivate category");
    } finally {
      setTimeout(() => setMessage(""), 3000);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Categories</h1>

      {message && <p className="text-sm text-wine mb-4">{message}</p>}
      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-5 space-y-3 h-fit">
          <h2 className="font-medium">{editingId ? "Edit Category" : "New Category"}</h2>
          <input
            name="name"
            placeholder="Category name"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-carbon/15 rounded-lg text-sm"
          />
          <select
            name="parent"
            value={formData.parent}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-carbon/15 rounded-lg text-sm"
          >
            <option value="">No parent (top-level)</option>
            {categories
              .filter((c) => c._id !== editingId) // a category can't be its own parent
              .map((c) => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
          </select>
          <textarea
            name="description"
            placeholder="Description (optional)"
            value={formData.description}
            onChange={handleChange}
            rows={2}
            className="w-full px-3 py-2 border border-carbon/15 rounded-lg text-sm"
          />
          <div className="flex gap-2">
            <button className="bg-wine text-white text-sm px-4 py-2 rounded-lg hover:bg-wine-dark transition-colors">
              {editingId ? "Save Changes" : "Create"}
            </button>
            {editingId && (
              <button type="button" onClick={cancelEdit} className="text-sm text-carbon/50 px-4 py-2">
                Cancel
              </button>
            )}
          </div>
        </form>

        <div className="md:col-span-2 bg-white rounded-xl shadow-sm overflow-hidden h-fit">
          <table className="w-full text-sm">
            <thead className="bg-carbon/5 text-left text-carbon/60">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Parent</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr key={cat._id} className="border-t border-carbon/10">
                  <td className="px-4 py-3">{cat.name}</td>
                  <td className="px-4 py-3 text-carbon/50">
                    {categories.find((c) => c._id === cat.parent)?.name || "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${cat.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                      {cat.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-3">
                      <button onClick={() => startEdit(cat)} className="text-wine hover:underline">Edit</button>
                      {cat.isActive && (
                        <button onClick={() => handleDelete(cat._id, cat.name)} className="text-red-600 hover:underline">
                          Deactivate
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CategoriesAdmin;