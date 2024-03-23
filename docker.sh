#!/bin/bash

IMG=pedestrian:8.1.4

check_image_existence() {
	docker inspect "${IMG}" >/dev/null 2>&1
}
build_image() {
	docker build -t "${IMG}" .
}

# Build if image doens't exist
check_image_existence || build_image

# Run container
RUN_CMD=(
	docker run --name "pedestrian-8-container"
	-v $HOME/proj/pedestrian-8/:/duckofdoom/
	-p 3000:3000
	-u 1000
	--rm
)
"${RUN_CMD[@]}" "${IMG}" bash setup-within-container.sh
"${RUN_CMD[@]}" "${IMG}"
# "${RUN_CMD[@]}" -it "${IMG}" bash
