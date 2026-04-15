import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const OAuthRedirect = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (token) {
      fetch(`${import.meta.env.VITE_API_BASE_URL}/customers/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => res.json())
        .then((user) => {
          console.log("OAuth user data:", user);
          login(
            {
              customerName: user.customerName,
              customerEmail: user.customerEmail,
              customerPhone: user.phone,
            },
            token,
          );
          navigate("/");
        })
        .catch(() => {
          alert("OAuth login failed.");
          navigate("/");
        });
    } else {
      navigate("/");
    }
  }, [navigate]);

  return <p className="text-center mt-20">Signing in with Google...</p>;
};

export default OAuthRedirect;
