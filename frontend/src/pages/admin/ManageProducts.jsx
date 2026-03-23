import React, { useState, useEffect } from 'react';
import { supabase } from '../../config/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import { Loader2, Plus, Edit, Trash2, X } from 'lucide-react';

const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

const ManageProducts = () => {
  const { currentUser } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '', price: 0, description: '', category: 'Domestic', brand: '', is_industrial: false, stock: 0, images: []
  });
  const [editId, setEditId] = useState(null);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);

    try {
      // Direct browser-to-Cloudinary upload (unsigned preset)
      const cloudinaryFormData = new FormData();
      cloudinaryFormData.append('file', file);
      cloudinaryFormData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
        method: 'POST',
        body: cloudinaryFormData,
      });
      const data = await res.json();

      if (data.secure_url) {
        setFormData({
          ...formData,
          images: [...formData.images, { url: data.secure_url, public_id: data.public_id }]
        });
      } else {
        throw new Error('Cloudinary upload failed');
      }
    } catch (error) {
      console.error('Image upload failed', error);
      alert('Image upload failed. Please check your Cloudinary upload preset.');
    }
    setUploading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        const { error } = await supabase
          .from('products')
          .update(formData)
          .eq('id', editId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('products')
          .insert(formData);
        if (error) throw error;
      }
      setModalOpen(false);
      fetchProducts();
    } catch (error) {
      console.error(error);
      alert(error.message || 'Product save failed.');
    }
  };

  const deleteHandler = async (id) => {
    if (window.confirm('Are you sure?')) {
      try {
        const { error } = await supabase
          .from('products')
          .delete()
          .eq('id', id);
        if (error) throw error;
        fetchProducts();
      } catch (error) {
        console.error(error);
      }
    }
  };

  const openEdit = (product) => {
    setFormData({
      name: product.name,
      price: product.price,
      description: product.description,
      category: product.category,
      brand: product.brand,
      is_industrial: product.is_industrial,
      stock: product.stock,
      images: product.images || []
    });
    setEditId(product.id);
    setModalOpen(true);
  };

  const openCreate = () => {
    setFormData({ name: '', price: 0, description: '', category: 'Domestic', brand: '', is_industrial: false, stock: 0, images: [] });
    setEditId(null);
    setModalOpen(true);
  };

  return (
    <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Manage Products</h1>
        <button onClick={openCreate} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl flex items-center shadow-lg transition">
          <Plus size={20} className="mr-2" /> Add Product
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-600" size={48} /></div>
      ) : (
        <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400">
                <th className="p-4 font-semibold">Image</th>
                <th className="p-4 font-semibold">ID</th>
                <th className="p-4 font-semibold">Name</th>
                <th className="p-4 font-semibold">Price</th>
                <th className="p-4 font-semibold">Category</th>
                <th className="p-4 font-semibold">Stock</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                  <td className="p-4">
                    {product.images && product.images.length > 0 ? (
                      <img src={product.images[0].url} alt={product.name} className="w-12 h-12 object-cover rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm" />
                    ) : (
                      <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center text-xs text-gray-400 shadow-sm border border-gray-200 dark:border-gray-700">No Img</div>
                    )}
                  </td>
                  <td className="p-4 text-sm text-gray-500 font-mono">{product.id.substring(0, 8)}...</td>
                  <td className="p-4 font-medium text-gray-900 dark:text-white">{product.name}</td>
                  <td className="p-4 text-gray-600 dark:text-gray-300">₹{Number(product.price).toLocaleString('en-IN')}</td>
                  <td className="p-4 text-gray-600 dark:text-gray-300">{product.category}</td>
                  <td className="p-4 text-gray-600 dark:text-gray-300 flex items-center">
                    {product.stock} {product.stock === 0 && <span className="ml-2 w-2 h-2 rounded-full bg-red-500"></span>}
                  </td>
                  <td className="p-4 text-right">
                    <button onClick={() => openEdit(product)} className="text-blue-600 hover:text-blue-900 mx-2 p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 transition">
                      <Edit size={18} />
                    </button>
                    <button onClick={() => deleteHandler(product.id)} className="text-red-600 hover:text-red-900 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 transition">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal for Create/Edit */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-center items-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
              <h2 className="text-2xl font-bold dark:text-white">{editId ? 'Edit Product' : 'Create Product'}</h2>
              <button onClick={() => setModalOpen(false)} className="text-gray-500 hover:text-gray-800 dark:hover:text-gray-200">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
                  <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full border rounded-lg p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Price</label>
                  <input type="number" required value={formData.price} onChange={(e) => setFormData({...formData, price: Number(e.target.value)})} className="w-full border rounded-lg p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea required value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full border rounded-lg p-2 h-24 dark:bg-gray-700 dark:border-gray-600 dark:text-white"></textarea>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                  <input type="text" required value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="w-full border rounded-lg p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Brand</label>
                  <input type="text" required value={formData.brand} onChange={(e) => setFormData({...formData, brand: e.target.value})} className="w-full border rounded-lg p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Stock</label>
                  <input type="number" required value={formData.stock} onChange={(e) => setFormData({...formData, stock: Number(e.target.value)})} className="w-full border rounded-lg p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input type="checkbox" checked={formData.is_industrial} onChange={(e) => setFormData({...formData, is_industrial: e.target.checked})} id="isInd" className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                <label htmlFor="isInd" className="text-gray-700 dark:text-gray-300 font-medium">Is Industrial Machine?</label>
              </div>

              <div className="border border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 text-center">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">Product Images (Direct Cloudinary Upload)</label>
                <div className="flex flex-wrap gap-4 mb-4 justify-center">
                  {formData.images.map((img, i) => (
                    <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden shadow-sm">
                      <img src={img.url} className="w-full h-full object-cover" alt="uploaded product" />
                    </div>
                  ))}
                </div>
                <input type="file" onChange={handleUpload} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                {uploading && <p className="text-sm text-blue-600 mt-2">Uploading...</p>}
              </div>

              <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition">
                {editId ? 'Update Product' : 'Save Product'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageProducts;
