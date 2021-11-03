# NEF_emulator

## ⚙ Setup locally

**Host prerequisites**: `docker`, `docker-compose`, `build-essential`\*, `jq`\*\*

After cloning the repository, there are 4 more steps to do. For convinience, we have created a [`Makefile`](Makefile) that contains a command for each step + several common `docker-compose` tasks which you may find handy in the future.

1. create your local `.env` file
2. build the container images
3. run the containers
4. add some test data (optional)

```bash
cd NEF_emulator

# 1.
make prepare-dev-env

# 2.
make build

# 3.
make up

# 4.
make db-init-simple
```

>\* 💡 Info: *To use the `make` command you need to `apt install build-essential` first. In case you don't want to proceed with this installation, you can head over to the `Makefile` and copy/paste the shell commands that are being used for every step.*

> \*\* 💡 Info: *The shell script used at step 4 (for adding test data) uses `jq` which is a lightweight and flexible command-line JSON processor. You can install it with `apt install jq`*

### Try out your setup

After the containers are up and running:

 - access and start playing with the Swager UI at: [localhost:8888/docs](http://localhost:8888/docs)
 - login to the admin dashboard at: [localhost:8888/login](http://localhost:8888/login)
     - Default credentials: `admin@my-email.com` / `pass`
     - they can be found/changed inside your `.env` file



<br><br>



## 🏷️ How to work on a specific tag / release

After `git clone` or `git pull` you can specify the release you want to work on by just using its `tag` in the following command:

    git switch --detach tag_here

You will get into a *detached HEAD* state in Git, but this is perfectly fine, you can go back anytime by just using `git switch main`.  
Short reasoning on why we choose tags over branches:

>**A tag is immutable.**  
>[source](https://stackoverflow.com/questions/9810050/why-should-i-use-tags-vs-release-beta-branches-for-versioning/)
