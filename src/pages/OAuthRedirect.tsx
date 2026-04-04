import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const OAuthRedirect = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (token) {
      localStorage.setItem("dineflexUser", JSON.stringify({ token }));

      fetch(`${import.meta.env.VITE_API_BASE_URL}/customers/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => res.json())
        .then((user) => {
          localStorage.setItem("customer", JSON.stringify(user));
          navigate("/");
        })
        .catch(() => {
          alert("OAuth login failed.");
          navigate("/login");
        });
    } else {
      navigate("/login");
    }
  }, [navigate]);

  return <p className="text-center mt-20">Signing in with Google...</p>;
};

export default OAuthRedirect;
