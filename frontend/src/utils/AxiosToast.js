import toast from "react-hot-toast";

export const AxiosToast = (type, data) => {
  if (type === "success") {
    toast.success(data);
  } else {
    const errorMessage = data?.response?.data?.message || "An error occurred";
    toast.error(errorMessage);
    return {
      message: errorMessage,
    };
  }
};
