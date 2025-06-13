import React, { useState } from "react";
import { Box, Typography, Paper, useTheme, useMediaQuery } from "@mui/material";
import {
  School,
  CheckCircle,
  People,
  Shield,
  Star,
  Person,
} from "@mui/icons-material";
import AiAdvisorIllustration from "../../assets/images/ai-academic-advisor.png";

const AuthLayout = ({ children, showTestimonial = true }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("lg"));

  const [imageVisible, setImageVisible] = useState(true);

  const handleImageError = () => {
    setImageVisible(false);
  };

  const features = [
    "Get instant answers about your degree requirements",
    "Plan optimal schedules that fit your lifestyle",
    "Track your progress toward graduation",
    "Connect with human advisors when needed",
  ];

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: { xs: "column", lg: "row" },
      }}
    >
      {/* Left Side - Branding & Value Proposition */}
      <Box
        sx={{
          background:
            "linear-gradient(135deg, #026937 0%, rgba(2, 105, 55, 0.9) 100%)",
          color: "white",
          width: { xs: "100%", lg: "40%" },
          p: { xs: 4, lg: 6 },
          display: "flex",
          flexDirection: "column",
          minHeight: { xs: "auto", lg: "100vh" },
        }}
      >
        {/* Logo and Title */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Paper
              sx={{
                bgcolor: "white",
                p: 1.5,
                borderRadius: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <School sx={{ color: "#026937", fontSize: 28 }} />
            </Paper>
            <Box sx={{ ml: 2 }}>
              <Typography variant="h5" fontWeight="bold">
                SELU
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Computer Science Academic Advisor
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Hero Illustration */}
        {imageVisible && (
          <Box sx={{ mb: 6, display: "flex", justifyContent: "center" }}>
            <Box
              component="img"
              src={AiAdvisorIllustration}
              alt="AI Academic Advisor Interface"
              sx={{
                width: "100%",
                maxWidth: 400,
                borderRadius: 2,
                boxShadow: 3,
              }}
              onError={handleImageError}
            />
          </Box>
        )}

        {/* Value Proposition */}
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h4"
            fontWeight="bold"
            sx={{ mb: 3, fontSize: { xs: "1.75rem", lg: "2rem" } }}
          >
            Your 24/7 Academic Success Partner
          </Typography>

          <Box>
            {features.map((feature, index) => (
              <Box
                key={index}
                sx={{ display: "flex", alignItems: "flex-start", mb: 2 }}
              >
                <CheckCircle
                  sx={{ color: "#FFC629", mt: 0.5, mr: 2, flexShrink: 0 }}
                />
                <Typography variant="body1">{feature}</Typography>
              </Box>
            ))}
          </Box>
        </Box>

        {/* Trust Badges */}
        <Box sx={{ mt: "auto", pt: 4 }}>
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <People sx={{ color: "#FFC629", mr: 2 }} />
              <Typography variant="body2">
                Trusted by 500+ SELU CS students
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Shield sx={{ color: "#FFC629", mr: 2 }} />
              <Typography variant="body2">
                FERPA compliant and secure
              </Typography>
            </Box>
          </Box>

          {/* Testimonial */}
          {showTestimonial && (
            <Paper
              sx={{
                bgcolor: "rgba(255, 255, 255, 0.1)",
                p: 3,
                borderRadius: 2,
                backdropFilter: "blur(10px)",
              }}
            >
              <Typography
                variant="body2"
                sx={{ fontStyle: "italic", mb: 2, color: "white" }}
              >
                "The AI advisor helped me graduate a semester early!"
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      bgcolor: "rgba(255, 255, 255, 0.2)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mr: 2,
                    }}
                  >
                    <Person sx={{ fontSize: 20, color: "white" }} />
                  </Box>
                  <Box>
                    <Typography variant="body2" fontWeight="medium">
                      Sarah M.
                    </Typography>
                    <Typography variant="caption">CS '24</Typography>
                  </Box>
                </Box>
                <Box sx={{ display: "flex" }}>
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} sx={{ color: "#FFC629", fontSize: 16 }} />
                  ))}
                </Box>
              </Box>
            </Paper>
          )}
        </Box>
      </Box>

      {/* Right Side - Auth Forms */}
      <Box
        sx={{
          width: { xs: "100%", lg: "60%" },
          p: { xs: 4, lg: 6 },
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          minHeight: { xs: "auto", lg: "100vh" },
        }}
      >
        <Box sx={{ maxWidth: 480, mx: "auto", width: "100%" }}>{children}</Box>
      </Box>
    </Box>
  );
};

export default AuthLayout;
