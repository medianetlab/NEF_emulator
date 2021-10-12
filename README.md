# NEF_emulator

## ⚙ Setup locally

After cloning the repository, there are 4 more steps to do. For convinience, we have created a [`Makefile`](Makefile) that contains a command for each step + several common `docker-compose` tasks which you may find handy in the future.

1. create your local `.env` file
2. build the container images
3. run the containers
4. add some test data (optional)

```bash
# 1.
make prepare-dev-env

# 2.
make build

# 3.
make up

# 4.
make db-init-simple
```
