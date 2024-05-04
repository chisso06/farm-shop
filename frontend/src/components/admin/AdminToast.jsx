import { useContext } from "react";
import { AdminToastContext } from "../../functions/ToastFunc";

const AdminToast = () => {
	const context = useContext(AdminToastContext);

	if (context.message) {
		return (
			<div className="w-4/5 px-2 py-2 fixed top-16">
				<div className="px-4 py-2 flex bg-stone-100 bg-opacity-80 rounded">
					<p className="my-auto block sm:inline">{context.message}</p>
					<span
						className="ml-auto text-stone-400 hover:text-stone-800 rounded-lg inline-flex items-center justify-center"
						onClick={() => {context.setMessage('')}}>
						<svg
							className="h-3"
							aria-hidden="true"
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 14 14"
							role="button"
						>
							<path
								stroke="currentColor"
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth="2"
								d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
							/>
						</svg>
					</span>
				</div>
			</div>
		)
	}
}

export default AdminToast;
