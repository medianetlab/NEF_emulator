# NEF_emulator


<p align="center">
  <img src="./backend/app/app/static/NEF_logo_400x400_light.svg" />
</p>

## Contents

- [Setup locally](#-setup-locally)
  - [Try out your setup](#try-out-your-setup)
- [How to work with a specific tag / release](#%EF%B8%8F-how-to-work-on-a-specific-tag--release)
- [NetApp communication options](#%EF%B8%8F-netapp-communication-options)
- [Integration with CAPIF](#integration-with-capif)

## ⚙ Setup locally

**Host prerequisites**: `docker`, `docker-compose 1.29.2`, `build-essential`\*, `jq`\*\*

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
make db-init
```

>\* 💡 Info: *To use the `make` command you need to `apt install build-essential` first. In case you don't want to proceed with this installation, you can head over to the `Makefile` and copy/paste the shell commands that are being used for every step.*

> \*\* 💡 Info: *The shell script used at step 4 (for adding test data) uses `jq` which is a lightweight and flexible command-line JSON processor. You can install it with `apt install jq`*

### Try out your setup

After the containers are up and running:

 - access and start playing with the Swager UI at: [localhost:8888/nef/docs](http://localhost:8888/nef/docs)
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



<br><br>



## ↔️ NetApp communication options

Below, you may find different options for establishing a bi-directional communication over HTTP between the NetApp and the NEF_emulator (for example to be used for `callbacks`).

### 1. via `host.docker.internal`

If you develop your NetApp directly on the host, for example a `Flask` app running on port `9999`:
 - you will be able to connect to the NEF_emulator at: `http://localhost:8888`
 - the NEF_emulator will **not** be able to connect to `http://localhost:9999` because "localhost" for a container is itself, not the host.
 - to overcome the above problem, Docker provides `host.docker.internal`
 - the NEF_emulator will be able to connect to `http://host.docker.internal:9999`
 - ⚠ make sure you bind your NetApp on `0.0.0.0:[port]` and not only on `127.0.0.1:[port]`

```
┌───────────────────────────────────────────────────────────────┐
│                          HOST                                 │
│                                                               │
│                        ┌───────────────────────────────┐      │
│      NetApp            │    docker-compose network     │      │
│         │              ├───────────────────────────────┤      │
│         │              │    NEF_emulator containers    │      │
│         │              │           live here           │      │
│         │              └── :80 ────────────── :5050 ───┘      │
│         │                   │                   │             │
│         │                   │                   │             │
└────── :9999 ───────────── :8888 ───────────── :5050 ──────────┘
          │                   │ 
          └─< communication >─┘
```

<br>

### 2. via the same docker `bridge` network

If you develop your NetApp as a container, the easiest way to establish a bi-directional communication would be to `attach` it to the pre-existing bridge network that the NEF_emulator containers use:
 - this bridge network is automatically created whenever you `docker-compose up` a project, in our case that would probably be named as `nef_emulator_default`
 - Docker will provide automatic DNS resolution between these containers names
 - your NetApp will be able to connect to the NEF_emulator at `http://backend`
 - the NEF_emulator will be able to connect to your NetApp at `http://your_netapp_container_name:9999`
 - ⚠ make sure you use the container ports directly, not the `published` ones
 - ⚠ make sure you first `docker-compose up` the NEF_emulator and then `attach` your NetApp container
 - more details at Docker docs: [Use bridge networks](https://docs.docker.com/network/bridge/) and [Networking in Compose](https://docs.docker.com/compose/networking/)

```
┌───────────────────────────────────────────────────────────────┐
│                          HOST                                 │
│                                                               │
│    ┌───────────────────────────────────────────────────┐      │
│    │               docker-compose network              │      │
│    ├───────────────────────────────────────────────────┤      │
│    │                                                   │      │
│    │  NetApp                NEF_emulator containers    │      │
│    │ also lives here               live here           │      │
│    │                                                   │      │
│    └─── :9999 ──────────── :80 ────────────── :5050 ───┘      │
│         │                   │                   │             │
│         ├─< communication >─┤                   │             │
│         │                   │                   │             │
│         │                   │                   │             │
└────── :9999 ───────────── :8888 ───────────── :5050 ──────────┘
```

Three possible ways to achieve the above approach:

1. with **docker**, try the `--net=...` option and provide the bridge name that you want to `attach` to:

       docker container run --net=nef_emulator_default ...

2. with **docker-compose**, try adding the bridge as an external network, something like:


       services:
       ....
           netapp:
           ....
               networks:
                  - nef_emulator_default
       networks:
         nef_emulator_default:
           external: true

3. with **docker network connect**, try adding your container to the bridge network:

       docker network connect BRIDGE_NAME NETAPP_NAME

## Integration with CAPIF

In order to integrate NEF Emulator with CAPIF you should perform the following steps:

1. The first step is to ensure that all CAPIF services are up and running. After cloning the code from the official github repository https://github.com/EVOLVED-5G/CAPIF_API_Services you can execute:

```
cd services/

sudo ./run.sh

./check_services_are_running.sh
```

2. Then, in NEF Emulator project, change the `EXTERNAL_NET` environment variable to **true** in `.env` file. This will enable NEF containers to join CAPIF's pre-existing network (services_default)

3. Start NEF services either using `make up` or `make debug-up` commands

NEF should be successfully onboard to CAPIF Core Function. To ensure that, the following files should be created in `app/core/certificates/` folder:

```
ca.crt
private.key
test_nef01.crt
capif_exposer_details.json
```
