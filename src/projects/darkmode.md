---
visibleOnSite: false
featured: false
featuredOrder: 99
workOrder: 99
passwordProtected: false
password: ""
title: Aha! Dark Mode
summary: Research shows that dark mode is popular among software developers.
  Because of this, I was tasked with defining and designing a new dark theme as
  part of the launch of Aha!'s new agile development tool, Aha! Develop.
slug: darkmode
cardDescription: Exploring dark mode for the web app.
cardTag: Product Design
cardThumb: /projects/darkmode/images/darkmode-split.png
sections:
  - heading: Background
    blocks:
      - type: text
        body: >-
          <p>In 2021, Aha! expanded its product offering to introduce a new,
          fully extendable, agile development tool. This product, targeted at
          software development teams, would integrate deeply with the company's
          flagship strategic planning and roadmapping software.</p>


          <p>Our research into the market and target personas indicated that dark mode was an important feature for engineers, so we made it a priority for Aha! Develop.</p>
      - type: images
        items:
          - src: darkmode-split.png
            caption: The sprint planning page is one of Aha! Develop's key features.
  - heading: The Challenge
    blocks:
      - type: text
        body: >-
          <p>While there were some universal styles in place, a lot of one-off
          instances of color styling had accrued over the years. This made the
          project specifically challenging because there was a significant
          amount of clean up that needed to be done in order to introduce a new
          theme.</p>


          <p>Another challenging aspect was that Aha! had an existing user-base that had had the ability to customize colors of UI elements for years. These custom colors would then be used in various ways, from the color of a status pill, tag, or the background of a record card. We needed to ensure that we weren't breaking user-created custom colors, while transitioning our default set of colors to a set that worked in dark mode.</p>
  - heading: Our Goals
    blocks:
      - type: text
        body: <p>The primary goal was to introduce dark mode for Aha! Develop because
          our research indicated that this was considered a must-have feature
          for many software engineers, the target persona for the product.
          However, years of technical debt required a clean up of the code to
          support theming. That became an additional goal for the project.</p>
  - heading: My Role
    blocks:
      - type: text
        body: <p>I was one of the lead designers on the Aha! Develop launch and my
          unabashed love for dark mode meant this was a project I had to take. I
          partnered closely with the engineer on the project to define a new
          color palette and create dark mode versions of common screens to
          validate.</p>
  - heading: Color & Components
    blocks:
      - type: text
        body: <p>We started by auditing existing color usage and defining a dark palette
          that preserved contrast and hierarchy. Custom user colors needed to
          keep working, so we validated pills, tags, and record cards against
          both themes.</p>
      - type: images
        items:
          - src: color-picker.png
            caption: ""
      - type: images
        items:
          - src: components/buttons-dm.png
            caption: ""
          - src: components/table-light.png
            caption: Light mode table
          - src: components/table-dm.png
            caption: Dark mode table
  - heading: Key Screens
    blocks:
      - type: text
        body: <p>After the foundation was in place, I created dark mode treatments for
          the product's most important workflows — comparing each screen to its
          light mode counterpart to ensure parity.</p>
      - type: images
        items:
          - src: sprint-planning-light.png
            caption: Sprint planning — light mode
          - src: sprint-planning-dm.png
            caption: Sprint planning — dark mode
      - type: images
        items:
          - src: workflow-board-light.png
            caption: Workflow board — light mode
          - src: workflow-board-dm.png
            caption: Workflow board — dark mode
      - type: images
        items:
          - src: empathy-session-light.png
            caption: Empathy session — light mode
          - src: empathy-session-dm.png
            caption: Empathy session — dark mode
      - type: images
        items:
          - src: features-board-dm.png
            caption: ""
          - src: features-board-colorful-dm.png
            caption: ""
  - heading: Details & Polish
    blocks:
      - type: text
        body: <p>Record details, drawers, editors, and supporting UI patterns all needed
          dark treatments that felt native — not like an inverted
          afterthought.</p>
      - type: images
        items:
          - src: Drawer-dm.png
            caption: ""
          - src: details-view-dm.png
            caption: ""
          - src: text-editor-full-dm.png
            caption: ""
      - type: images
        items:
          - src: roadmap-dm.png
            caption: ""
          - src: reports-dm.png
            caption: ""
          - src: empty-state-dm.png
            caption: ""
          - src: feedback-widget-dm.png
            caption: ""
  - heading: The Result
    blocks:
      - type: text
        body: <p>Dark mode shipped as part of Aha! Develop and gave engineering teams a
          theme that matched how they already worked in their own tools. The
          project also pushed theming infrastructure forward across the product
          — making future visual updates easier to deliver.</p>
---
