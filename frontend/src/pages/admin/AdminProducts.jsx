import { React, useState } from 'react';
import AdminProductsForm from '../../components/admin/AdminProductForm';
import AdminProductsIndex from '../../components/admin/AdminProductsIndex';

const AdminProducts = () => {
	const [productId, setProductId] = useState(-1);

	return (
		productId >= 0 ? 
		<AdminProductsForm productId={productId} setProductId={setProductId} />
		:
		<AdminProductsIndex setProductId={setProductId} />
	)
}

export default AdminProducts;
