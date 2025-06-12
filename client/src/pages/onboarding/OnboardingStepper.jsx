import React from "react";
import { Box, Typography, Step, Stepper, StepLabel } from "@mui/material";

const steps = ["Academic Profile", "Course History", "Preferences"];

function OnboardingStepper({ activeStep }) {
  return (
    <Box sx={{ maxWidth: 800, mx: "auto", mb: 4 }}>
      <Stepper activeStep={activeStep} alternativeLabel>
        {steps.map((label, index) => (
          <Step key={label}>
            <StepLabel
              sx={{
                "& .MuiStepIcon-root": {
                  color: index <= activeStep ? "primary.main" : "grey.300",
                },
                "& .MuiStepLabel-label": {
                  color:
                    index <= activeStep ? "primary.main" : "text.secondary",
                  fontWeight: index === activeStep ? "bold" : "normal",
                },
              }}
            >
              <Typography variant="caption">{label}</Typography>
            </StepLabel>
          </Step>
        ))}
      </Stepper>
    </Box>
  );
}

export default OnboardingStepper;
