# PARKSIGHT AI – PHASE 3 PROJECT REPORT

## 1. Introduction

ParkSight AI is a smart parking management web application developed to address the everyday problem of finding available parking spaces in crowded parking areas. Drivers visiting shopping centres, colleges, hospitals, offices, and public places may spend unnecessary time searching for an empty parking bay. This can cause traffic congestion within parking areas, increase fuel consumption, create frustration, and reduce the overall parking experience.

The main objective of ParkSight AI is to demonstrate how software, computer vision concepts, data processing, and intelligent recommendations can improve parking management. The project provides a web-based interface through which users can explore parking information, view parking occupancy, identify available spaces, and receive recommendations for suitable parking bays.

Phase 3 focuses on improving the project's technical stability, frontend and backend integration, API functionality, deployment, and readiness for demonstration. The current version is an academic prototype that uses simulated parking activity to demonstrate its features. It provides a foundation for future integration with a real computer vision service.

## 2. Problem Statement

Traditional parking facilities often require drivers to search manually for vacant spaces. In many locations, drivers do not have access to accurate, centralised information about parking availability. They may drive through multiple rows before finding a suitable space.

This problem becomes more noticeable during busy periods when parking demand is high. Repeated searching wastes time and fuel and may contribute to unnecessary vehicle movement and congestion.

A software-based parking assistance system can help address this problem by presenting parking availability in an organised digital interface. By displaying occupancy information and suggesting suitable spaces, such a system can make the parking process more convenient and efficient.

ParkSight AI explores this solution through a web application that combines parking data, simulated occupancy updates, recommendation logic, and a user-friendly interface.

## 3. Project Objectives

The main objectives of ParkSight AI are:

1. To develop an accessible and responsive smart parking website.
2. To present parking lots, parking bays, and occupancy information in an organised format.
3. To demonstrate how available spaces can be recommended to drivers.
4. To provide backend API endpoints for parking information and system health checks.
5. To explore how computer vision services could supply vehicle and parking occupancy data.
6. To demonstrate parking activity using a simulation engine when live detection is unavailable.
7. To deploy the application online so that users and evaluators can access it through a browser.
8. To create a maintainable project structure that supports future improvements.

## 4. Proposed Solution

ParkSight AI provides a centralised digital interface for exploring parking availability. Instead of relying entirely on manual searching, users can interact with the website and view the parking information made available by the application.

The frontend presents the information in a visual and understandable way. The backend provides structured data through API endpoints. The application can use simulated parking activity to demonstrate changing occupancy and recommendations.

The project also explores the integration of an external YOLO-based computer vision service. Such a service could analyse camera images and identify vehicles or parking occupancy. However, real-time CCTV detection depends on configuring and connecting a suitable external inference service. The currently deployed demonstration operates in simulated mode and does not claim to perform live CCTV detection.

## 5. Technology Stack

The project uses the following technologies:

**Frontend:** React 19, TypeScript, Vite, and Tailwind CSS are used to build the interactive user interface and support a maintainable frontend structure.

**Backend:** Node.js and Express provide server-side functionality and API endpoints for parking information and system health.

**Data Processing:** TypeScript-based application logic supports parking data processing, occupancy handling, recommendation calculations, and simulation behaviour.

**Computer Vision Integration:** The architecture supports integration with an external YOLO-based inference service. OpenCV and related computer vision tools may be used within an appropriately configured detection pipeline.

**Deployment:** GitHub is used for source-code version control, while Vercel hosts the deployed web application and supports the configured serverless API functionality.

These technologies provide a practical foundation for developing and demonstrating a software-based parking management prototype.

## 6. System Architecture

ParkSight AI follows a frontend-backend architecture. The frontend is responsible for presenting information and receiving user interactions. The backend processes requests and returns structured responses through API endpoints.

The application can obtain parking data from its simulation engine. The simulation provides example parking occupancy and vehicle activity, allowing the interface to demonstrate how a smart parking system might behave without requiring physical sensors or a live camera installation.

The architecture also includes a possible connection to an external computer vision service. In a future live implementation, camera frames could be processed by that service, and its detections could be converted into occupancy information for the application.

The main workflow is:

1. A user opens the ParkSight AI website.
2. The frontend requests relevant parking information from the backend.
3. The backend returns structured parking and bay data.
4. The interface displays the available information and simulated activity.
5. Recommendation logic can use the available parking data to identify a suitable bay.
6. The user explores the displayed information and follows the suggested parking option.

This modular structure separates the user interface from the backend and allows future development without redesigning the entire system.

## 7. Major Features

### 7.1 Parking Occupancy Display

The application presents parking information in a structured format so users can understand the state of parking facilities. The prototype uses simulated data to demonstrate occupancy information and the relationship between parking bays and parking lots.

### 7.2 AI-Based Recommendation Concept

ParkSight AI demonstrates a recommendation interface intended to help users identify a suitable parking space. Factors such as walking distance, distance to a destination, and congestion-related information can be used in recommendation logic. These recommendations should be understood as prototype outputs based on the data currently available.

### 7.3 Parking Navigation Concept

The interface explores guiding users towards a recommended parking section, row, or bay. This feature demonstrates how parking information could be connected to a navigation workflow. Actual turn-by-turn navigation depends on the accuracy and completeness of the facility's mapped layout.

### 7.4 Simulation Engine

The simulation engine generates example parking activity so the website can demonstrate occupancy changes and related interface features. This makes it possible to test the application without installing cameras, sensors, or other physical equipment.

### 7.5 Backend API

The backend exposes endpoints that provide structured application data. The health endpoint helps verify that the service is running, while the parking endpoint provides parking lot and bay information.

### 7.6 Responsive User Interface

The website is designed to present its information through a browser-based interface. Its components organise parking data, recommendations, system information, and related features into a single application.

## 8. Phase 3 Implementation and Improvements

During Phase 3, attention was given to improving the project's build stability, deployment configuration, and backend accessibility.

A dependency compatibility issue involving esbuild was addressed by updating its development dependency version in the project configuration. Dependencies were installed successfully, and the production build was checked before deployment.

The deployment configuration was adjusted to use Vite as the frontend framework in Vercel. The latest Review 3 code was committed to the dedicated GitHub branch named review-3 and deployed through Vercel.

The deployed application was tested through its website interface and backend endpoints. The health endpoint returned a successful service response containing version, review stage, runtime, and simulation information. The parking endpoint also returned structured parking data.

These checks indicate that the deployed prototype and its tested API routes were responding successfully at the time of verification.

## 9. Testing and Validation

Testing focused on confirming that the application could build, deploy, and return expected responses.

**Build testing:** The project's dependencies were installed, and the production build completed successfully after the dependency fix.

**Website testing:** The deployed website was opened in a browser, and the user interface and tested features were checked.

**API health testing:** The health endpoint was accessed to verify that the backend service responded with a status of OK.

**Parking data testing:** The parking endpoint was accessed and returned parking lot and bay data, including simulation-related fields.

**Deployment testing:** The latest Review 3 commit was deployed successfully to Vercel with a Ready status.

These tests validate the main prototype workflow and deployment. They do not establish production-level reliability, real-world detection accuracy, or performance under large numbers of simultaneous users. Additional testing would be required before operational use.

## 10. Deployment and Version Control

The source code is maintained in the public GitHub repository:

https://github.com/IdhreesGit/parksight-ai

The latest Review 3 implementation is maintained on the review-3 branch:

https://github.com/IdhreesGit/parksight-ai/tree/review-3

The deployed website is available at:

https://parksight-m9df3lht6-idhreesanbia2015-3707.vercel.app

Git and GitHub provide version control and a record of code changes. Vercel provides the hosting environment used for the deployed demonstration. Keeping Review 3 on a separate branch allows the latest implementation to be reviewed without automatically replacing the main branch.

## 11. Limitations

ParkSight AI is currently an academic prototype. Its parking activity is simulated, and its displayed occupancy information should not be interpreted as verified live parking availability.

Real-time operation would require a configured computer vision inference service, appropriate camera input, reliable communication between services, and validation of detection results. The quality of occupancy information would depend on camera placement, lighting, occlusion, model performance, and the mapping of detected vehicles to parking bays.

The current demonstration also does not prove that its recommendations reduce parking search time by a specific percentage. Such outcomes would need to be measured through controlled testing in an actual parking facility.

## 12. Future Scope

Future improvements could include connecting a real YOLO-based detection service, testing the system with authorised camera feeds, and improving occupancy accuracy through real-world validation.

Other possible improvements include user accounts, parking reservations, live occupancy updates, facility-specific navigation maps, accessibility-based recommendations, historical occupancy analytics, and notifications when suitable spaces become available.

Performance monitoring, security reviews, privacy safeguards, automated testing, and evaluation under different traffic conditions would also be important before using the system in an actual parking facility.

## 13. Conclusion

ParkSight AI demonstrates how a software-based smart parking application can organise parking information and present occupancy data, recommendations, and navigation concepts through a web interface. Phase 3 strengthened the project's build configuration, deployment setup, API accessibility, and demonstration readiness.

The project successfully demonstrates a working prototype using simulated parking activity, with a technical structure that can support future computer vision integration. Although live CCTV-based detection has not been established in the current deployment, the prototype provides a useful starting point for further research and development in intelligent parking management.

Overall, ParkSight AI illustrates the potential of combining web technologies, structured parking data, simulation, and recommendation logic to explore a more convenient parking experience.
