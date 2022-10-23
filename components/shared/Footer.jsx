import { useFooterStyles } from "../../styles/shared/footer.styles";
import * as React from "react";
import GitHubIcon from "@mui/icons-material/GitHub";

export default function Footer() {
  const classes = useFooterStyles();
  const currentYear = new Date().getFullYear();
  return (
    <footer className={classes.root}>
      <div className={classes.contentContainer}>
        &#169; Salaheddine El Farissi, {currentYear}. Open sourced on
        <a
          href={"https://github.com/salahelfarissi/salahelfarissi.github.io"}
          target={"_blank"}
          rel="noreferrer"
          className={classes.githubLink}
        >
          <GitHubIcon />
        </a>
      </div>
    </footer>
  );
}
